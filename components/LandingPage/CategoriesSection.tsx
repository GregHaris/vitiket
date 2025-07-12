"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Categories } from "@/constants/categoriesData";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";

export function CategoriesSection() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle category selection
  const handleCategoryClick = (category: string) => {
    let newUrl = "";

    if (category !== "All") {
      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "category",
        value: category.toLowerCase(),
      });
    } else {
      newUrl = removeKeysFromQuery({
        params: searchParams.toString(),
        keysToRemove: ["category"],
      });
    }

    router.push(newUrl, { scroll: false });
  };

  return (
    <section className="py-20 bg-gray-900 w-full">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-white mb-4">
            Explore by interest
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Find events that match your passion and expertise
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {Categories.map((category, index) => (
            <div
              key={index}
              onClick={() => handleCategoryClick(category.label)}
              className="group cursor-pointer"
            >
              <div className="text-center p-6 rounded-3xl bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50 hover:border-[#123f70]/30 hover:shadow-lg hover:shadow-[#123f70]/10 transition-all duration-300 group-hover:scale-105">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300`}
                >
                  <category.icon className="w-8 h-8 text-neutral-white" />
                </div>
                <h3 className="font-semibold text-neutral-white mb-2 text-sm truncate">
                  {category.label}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
