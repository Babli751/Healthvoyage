export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container inner">
        <div>
          <strong>HealthVoyage</strong> — Medical tourism & sanatorium booking
          <br />
          Clinics, hospitals and health resorts across the region.
        </div>
        <div>
          © {new Date().getFullYear()} HealthVoyage. For international patients.
        </div>
      </div>
    </footer>
  );
}
