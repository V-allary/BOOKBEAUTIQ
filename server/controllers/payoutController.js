import paystackRequest from "../utils/paystack.js";
import Business from "../models/Business.js";

// List Paystack-supported banks (for a dropdown on the frontend)
export const getBankList = async (req, res) => {
    try {
      const banks = await paystackRequest("/bank?country=kenya&currency=KES");
      res.status(200).json(banks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
 
// Verify a bank account number resolves to a real name before saving
 // Verify a bank account number resolves to a real name before saving
export const verifyBankAccount = async (req, res) => {
  try {
    const { accountNumber, bankCode, accountReference } = req.body;

    // Reject non-string values (blocks object/NoSQL-style payloads)
    if (typeof accountNumber !== "string" || typeof bankCode !== "string") {
      return res.status(400).json({ message: "Invalid account details." });
    }

    let url =
      `/bank/resolve?account_number=${encodeURIComponent(accountNumber.trim())}` +
      `&bank_code=${encodeURIComponent(bankCode.trim())}`;

    // Paybill only: the account number within the business number.
    // TODO: confirm Paystack's exact param name for this (account_reference is a guess).
    if (typeof accountReference === "string" && accountReference.trim()) {
      url += `&account_reference=${encodeURIComponent(accountReference.trim())}`;
    }

    const result = await paystackRequest(url);

    res.status(200).json(result); // { account_number, account_name }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 
export const setupPayoutAccount = async (req, res) => {
  try {
    const { businessId, bankCode, bankName, accountNumber, accountReference, accountName } = req.body;

    if (typeof accountNumber !== "string" || typeof bankCode !== "string") {
      return res.status(400).json({ message: "Invalid account details." });
    }

    const business = await Business.findById(businessId);
    if (!business) return res.status(404).json({ message: "Business not found." });

    const isOwner = business.owner?.toString() === req.user.userId;
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "You can only manage your own business's payout account." });
    }

    // Paybill only: the account number within the business number.
    // TODO: confirm Paystack's exact param name (account_reference is a guess).
    const referenceField =
      typeof accountReference === "string" && accountReference.trim()
        ? { account_reference: accountReference.trim() }
        : {};

    const hadSubaccount = Boolean(business.paystackSubaccountCode);
    let subaccount;

    if (hadSubaccount) {
      // Already has one — update it in place, don't create a duplicate.
      subaccount = await paystackRequest(
        `/subaccount/${business.paystackSubaccountCode}`,
        "PUT",
        {
          business_name: business.name,
          settlement_bank: bankCode,
          account_number: accountNumber,
          ...referenceField,
        }
      );
    } else {
      // First time setting up payouts for this business.
      subaccount = await paystackRequest("/subaccount", "POST", {
        business_name: business.name,
        settlement_bank: bankCode,
        account_number: accountNumber,
        percentage_charge: 0,
        ...referenceField,
      });
    }

    business.paystackSubaccountCode = subaccount.subaccount_code || business.paystackSubaccountCode;
    business.bankCode = bankCode;
    business.bankName = bankName;
    business.bankAccountNumber = accountNumber.slice(-4).padStart(accountNumber.length, "*"); // store masked
    business.bankAccountName = accountName;

    await business.save();

    res.status(200).json({
      message: hadSubaccount
        ? "Payout account updated successfully."
        : "Payout account linked successfully.",
      business,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};