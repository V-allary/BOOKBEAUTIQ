function BookingSummary({
  selectedService,
  selectedStaff,
  selectedDate,
  selectedTime,
  onContinue,
}) {
  return (
    <div className="sticky top-28 rounded-2xl border border-[#E5E2DF] bg-white p-7 shadow-sm">
      <h2 className="text-lg font-bold text-[#242424]">Booking Summary</h2>

      <div className="mt-6 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Service</span>
          <span className="font-semibold text-[#242424]">
            {selectedService?.name || "Not selected"}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Professional</span>
          <span className="font-semibold text-[#242424]">
            {selectedStaff?.name || "Not selected"}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Date</span>
          <span className="font-semibold text-[#242424]">
            {selectedDate ? `${selectedDate.day} ${selectedDate.date} ${selectedDate.month}` : "Not selected"}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Time</span>
          <span className="font-semibold text-[#242424]">
            {selectedTime || "Not selected"}
          </span>
        </div>

        <hr className="border-[#E5E2DF]" />

        <div className="flex justify-between">
          <span className="font-bold text-[#242424]">Total</span>
          <span className="text-xl font-bold text-[#B96882]">
            {selectedService?.price ? `KES ${selectedService.price}` : "KES 0"}
          </span>
        </div>
      </div>

      {/* Deposit Notice */}
<div className="mt-5 rounded-xl border border-[#F0D8E2] bg-[#FFF7FA] p-4">
  <div className="flex gap-3">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F2E8EC] text-sm font-bold text-[#B96882]">
      i
    </div>

    <div>
      <p className="text-sm font-semibold text-[#242424]">
        Your deposit is redeemable
      </p>

      <p className="mt-1 text-sm leading-6 text-gray-600">
        The deposit you pay today will be deducted from the total cost
        of your service when you attend your appointment.
      </p>
    </div>
  </div>
</div>

      <button
        onClick={onContinue}
        className="mt-7 w-full rounded-xl bg-[#242424] py-4 text-sm font-bold text-white transition hover:bg-[#B96882]"
      >
        Continue to Checkout
      </button>
    </div>
  );
}

export default BookingSummary;
