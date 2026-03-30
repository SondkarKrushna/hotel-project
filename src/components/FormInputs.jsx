// components/FormInputs.jsx

export const Input = ({ label, placeholder, error, type = "text", name, value, onChange }) => (
  <div className="flex flex-col gap-1 w-full">
    <label className="text-sm font-medium">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      name={name}
      value={value || ""}
      onChange={onChange}
      className={`
        border rounded-md px-3 py-2 text-sm 
        placeholder-gray-400 placeholder-opacity-100
        focus:outline-none focus:ring-1 
        ${error ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-blue-400"}
      `}
    />

    {error && (
      <span className="text-xs text-red-500 mt-0.5">
        {error}
      </span>
    )}
  </div>
);

export const Select = ({ label, options, error, name, value, onChange }) => (
  <div className="flex flex-col gap-1 w-full">
    <label className="text-sm font-medium">{label}</label>

    <select
      name={name}
      value={value || ""}
      onChange={onChange}
      className={`
        border rounded-md px-3 py-2 text-sm 
        focus:outline-none 
        ${error ? "border-red-400 focus:ring-red-400" : "border-gray-200"}
      `}
    >
      <option value="">Select</option>
      {options.map((op, i) => {
        // Handle object format {value, display}
        if (typeof op === 'object' && op.value) {
          return (
            <option key={i} value={op.value}>
              {op.display}
            </option>
          );
        }
        
        // Handle string format "id|||display"
        if (typeof op === 'string' && op.includes('|||')) {
          const parts = op.split('|||');
          return (
            <option key={i} value={parts[0]}>
              {parts[1]}
            </option>
          );
        }
        
        // Handle plain string
        return (
          <option key={i} value={op}>
            {op}
          </option>
        );
      })}
    </select>

    {error && (
      <span className="text-xs text-red-500 mt-0.5">
        {error}
      </span>
    )}
  </div>
);

export const DateInput = ({ label, error, name, value, onChange }) => (
  <div className="flex flex-col gap-1 w-full">
    <label className="text-sm font-medium">{label}</label>

    <input
      type="date"
      name={name}
      value={value || ""}
      onChange={onChange}
      className={`
        border rounded-md px-3 py-2 text-sm 
        focus:outline-none 
        ${error ? "border-red-400 focus:ring-red-400" : "border-gray-200"}
      `}
    />

    {error && (
      <span className="text-xs text-red-500 mt-0.5">
        {error}
      </span>
    )}
  </div>
);

export const UploadInput = ({ label, error, onChange }) => (
  <div className="flex flex-col gap-1 w-full">
    <label className="text-sm font-medium">{label}</label>

    <input
      type="file"
      onChange={onChange}
      className={`
        border rounded-md px-3 py-2 text-sm 
        ${error ? "border-red-400" : "border-gray-200"}
      `}
    />

    {error && (
      <span className="text-xs text-red-500 mt-0.5">
        {error}
      </span>
    )}
  </div>
);
