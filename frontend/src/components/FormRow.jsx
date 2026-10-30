export default function FormRow({ label, ...inputProps }) {
  return (
    <label className="form-row">
      <span>{label}</span>
      <input {...inputProps} />
    </label>
  );
}

