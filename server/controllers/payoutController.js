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
export const verifyBankAccount = async (req, res) => {
  try {
    const { accountNumber, bankCode } = req.body;

    const result = await paystackRequest(
      `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`
    );

    res.status(200).json(result); // { account_number, account_name }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
 
export const setupPayoutAccount = async (req, res) => {
  try {
    const { businessId, bankCode, bankName, accountNumber, accountName } = req.body;

    const business = await Business.findById(businessId);
    if (!business) return res.status(404).json({ message: "Business not found." });

    const isOwner = business.owner?.toString() === req.user.userId;
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "You can only manage your own business's payout account." });
    }

    let subaccount;

    if (business.paystackSubaccountCode) {
      // Already has one — update it in place, don't create a duplicate.
      subaccount = await paystackRequest(
        `/subaccount/${business.paystackSubaccountCode}`,
        "PUT",
        {
          business_name: business.name,
          settlement_bank: bankCode,
          account_number: accountNumber,
        }
      );
    } else {
      // First time setting up payouts for this business.
      subaccount = await paystackRequest("/subaccount", "POST", {
        business_name: business.name,
        settlement_bank: bankCode,
        account_number: accountNumber,
        percentage_charge: 0, 
      });
    }

    business.paystackSubaccountCode = subaccount.subaccount_code || business.paystackSubaccountCode;
    business.bankCode = bankCode;
    business.bankName = bankName;
    business.bankAccountNumber = accountNumber.slice(-4).padStart(accountNumber.length, "*"); // store masked
    business.bankAccountName = accountName;

    await business.save();

    res.status(200).json({
      message: business.paystackSubaccountCode
        ? "Payout account updated successfully."
        : "Payout account linked successfully.",
      business,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
