import ServiceSelector from "./ServiceSelector";
import StaffSelector from "./StaffSelector";
import DateSelector from "./DateSelector";
import TimeSlots from "./TimeSlots";
import { getTotals } from "../../utils/servicePricing";

function BookingCard({
  businessId,
  services,
  staff,
  selectorsLoading,
  selectedServices,
  setSelectedServices,
  selectedStaff,
  setSelectedStaff,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
}) {
  const totalDuration = getTotals(selectedServices).duration;

  // Changing the services changes how long the appointment is, so any time
  // already picked may no longer fit. Clear it and let them pick again.
  const handleServicesChange = (next) => {
    setSelectedServices(next);
    setSelectedTime(null);
  };

  return (
    <div className="rounded-2xl border border-[#E5E2DF] bg-white p-7 shadow-sm">
      <h2 className="text-lg font-bold text-[#242424]">Book Your Appointment</h2>
      <p className="mt-1 text-sm text-gray-400">
        Choose your services, date, time and professional
      </p>

      <div className="mt-6 space-y-5">

        {/* Services (up to 3) */}
        <ServiceSelector
          services={services}
          selectedServices={selectedServices}
          setSelectedServices={handleServicesChange}
          loading={selectorsLoading}
        />

        {/* Date */}
        <DateSelector
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />

        {/* Time — uses the TOTAL duration of all chosen services */}
        <TimeSlots
          businessId={businessId}
          selectedDate={selectedDate}
          serviceDuration={totalDuration || undefined}
          selectedStaff={selectedStaff}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
        />

        {/* Staff — component itself returns null if there's no staff to choose from */}
        <StaffSelector
          staff={staff}
          selectedStaff={selectedStaff}
          setSelectedStaff={setSelectedStaff}
          loading={selectorsLoading}
        />

      </div>
    </div>
  );
}

export default BookingCard;
