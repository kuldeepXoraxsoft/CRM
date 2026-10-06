import { useCallback, useEffect, useState } from "react";
import SearchSelect from "./SearchSelect";
import { usersApi } from "../../api/Usersapi";

function toOption(user) {
  return {
    value: user.id,
    label: user.name,
    meta: user,
  };
}

export default function UserSearchSelect({
  value,
  onChange,
  isMulti = false,
  purpose = "assignment",
  label = "User",
  placeholder = "Select user...",
  searchPlaceholder = "Search users...",
  ...props
}) {
  const values = isMulti ? value || [] : value ? [value] : [];
  const [selectedOptions, setSelectedOptions] = useState([]);

  useEffect(() => {
    let active = true;
    if (!values.length) {
      setSelectedOptions([]);
      return undefined;
    }

    usersApi.options({ ids: values, purpose, limit: 20 }).then((result) => {
      if (!active) return;
      setSelectedOptions((result.data || []).map(toOption));
    });

    return () => {
      active = false;
    };
  }, [purpose, values.join(",")]);

  const searchUsers = useCallback(
    async (search) => {
      const result = await usersApi.options({
        search,
        purpose,
        ids: values,
        limit: 20,
      });
      const options = (result.data || []).map(toOption);
      setSelectedOptions((current) => {
        const map = new Map([...current, ...options].map((option) => [option.value, option]));
        return values.map((id) => map.get(id)).filter(Boolean);
      });
      return options;
    },
    [purpose, values.join(",")],
  );

  return (
    <SearchSelect
      {...props}
      label={label}
      options={selectedOptions}
      value={value}
      onChange={onChange}
      isMulti={isMulti}
      onSearch={searchUsers}
      debounceMs={350}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
    />
  );
}
