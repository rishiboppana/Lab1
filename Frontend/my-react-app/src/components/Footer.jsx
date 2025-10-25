export default function Footer() {
  return (
    <footer className="border-t bg-airbnb-light text-sm text-airbnb-gray mt-10">
      <div className="max-w-6xl mx-auto px-6 py-10 grid sm:grid-cols-3 gap-6">
        <div>
          <h3 className="font-semibold text-black mb-3">Support</h3>
          <ul className="space-y-1">
            <li>Help Center</li>
            <li>AirCover</li>
            <li>Anti-discrimination</li>
            <li>Disability support</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-black mb-3">Hosting</h3>
          <ul className="space-y-1">
            <li>Airbnb your home</li>
            <li>Resources</li>
            <li>Community forum</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-black mb-3">Airbnb</h3>
          <ul className="space-y-1">
            <li>Newsroom</li>
            <li>Investors</li>
            <li>Careers</li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 px-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Airbnb Clone · Coursework Project
      </div>
    </footer>
  );
}
