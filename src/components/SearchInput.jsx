import React from "react";
import { Search } from "lucide-react";

const SearchInput = () => {
  return (
    <div className="w-full max-w-sm">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2D9AD8]"
        />

        <input
          type="text"
          placeholder="Search..."
          className="
            w-full pl-10 pr-4 py-2
            rounded-[7px]
            border border-[#00000021]
            text-[13px]
            text-[#1E1E1E80]
            font-normal
            focus:outline-none
            focus:ring-2 focus:ring-[#2D9AD9]/40
            focus:border-[#2D9AD9]
            transition
          "
        />
      </div>
    </div>
  );
};

export default SearchInput;
