function DownloadApp() {
    return (
      <section className="bg-[#D9468F] py-24">
        <div className="mx-auto max-w-7xl px-6">
  
          <div className="rounded-[40px] bg-white p-12 text-center shadow-xl">
  
            <p className="font-semibold uppercase tracking-[4px] text-[#D9468F]">
              Mobile App
            </p>
  
            <h2 className="mt-4 text-4xl font-bold text-[#1F2937]">
              Book Beauty Appointments Anywhere
            </h2>
  
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              Discover, book and manage your appointments on the go with the
              BookBeautiq mobile app.
            </p>
  
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
  
              <button className="rounded-full bg-[#1F2937] px-8 py-4 font-semibold text-white hover:bg-black transition">
                Download for iPhone
              </button>
  
              <button className="rounded-full border border-[#D9468F] px-8 py-4 font-semibold text-[#D9468F] hover:bg-pink-50 transition">
                Download for Android
              </button>
  
            </div>
  
          </div>
  
        </div>
      </section>
    );
  }
  
  export default DownloadApp;