import { CATEGORIES, MAX_CATEGORIES } from "../constants/categories";

function CategoryPicker({ value = [], onChange, max = MAX_CATEGORIES }) {
  const toggle = (name) => {
    if (value.includes(name)) {
      onChange(value.filter((c) => c !== name));
    } else if (value.length < max) {
      onChange([...value, name]);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((name) => {
          const selected = value.includes(name);
          const locked = !selected && value.length >= max;

          return (
            <button
              key={name}
              type="button"
              onClick={() => toggle(name)}
              disabled={locked}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                selected
                  ? "bg-[#242424] text-white"
                  : "border border-[#DDDAD7] bg-white text-[#242424] hover:border-[#B96882] disabled:cursor-not-allowed disabled:opacity-40"
              }`}
            >
              {selected ? "✓ " : ""}
              {name}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-[#999]">
        Choose up to {max}. {value.length}/{max} selected.
      </p>
    </div>
  );
}

export default CategoryPicker;
