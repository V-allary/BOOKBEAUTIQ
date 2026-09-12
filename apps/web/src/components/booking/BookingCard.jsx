import ServiceSelector from "./ServiceSelector";
import StaffSelector from "./StaffSelector";
import DateSelector from "./DateSelector";
import TimeSlots from "./TimeSlots";

function BookingCard({
  businessId,
  services,
  staff,
  selectorsLoading,
  selectedService,
  setSelectedService,
  selectedStaff,
  setSelectedStaff,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
}) {
  return (
    <div className="rounded-2xl border border-[#E5E2DF] bg-white p-7 shadow-sm">
      <h2 className="text-lg font-bold text-[#242424]">Book Your Appointment</h2>
      <p className="mt-1 text-sm text-gray-400">Choose your service, professional, date and time</p>

      <div className="mt-6 space-y-5">

        {/* Service */}
        <ServiceSelector
          services={services}
          selectedService={selectedService}
          setSelectedService={setSelectedService}
          loading={selectorsLoading}
        />

        {/* Staff — component itself returns null if there's no staff to choose from */}
        <StaffSelector
          staff={staff}
          selectedStaff={selectedStaff}
          setSelectedStaff={setSelectedStaff}
          loading={selectorsLoading}
        />

        {/* Date */}
        <DateSelector
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />

        {/* Time — depends on the business's real hours + existing bookings */}
        <TimeSlots
          businessId={businessId}
          selectedDate={selectedDate}
          serviceDuration={selectedService?.duration}
          selectedStaff={selectedStaff}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
        />

      </div>
    </div>
  );
}

export default BookingCard;
