export default function MapIframe() {
  return (
    <iframe
      title="Haifly Trap Head Office"
      src="https://maps.google.com/maps?q=Eastline%20Complex,%20Abraham%20Adesanya,%20Ajah,%20Lagos&t=&z=14&ie=UTF8&iwloc=&output=embed"
      width="100%"
      height="100%"
      style={{ border: 0 }}
      allowFullScreen={false}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className="w-full h-full object-cover filter contrast-125 saturate-150"
    />
  );
}
