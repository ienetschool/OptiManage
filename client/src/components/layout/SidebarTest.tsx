import React from "react";

// Simple test component to check if the items are being processed
const testItems = [
  { title: "Patient Registration", href: "/patients" },
  { title: "Prescriptions", href: "/prescriptions" }, 
  { title: "Specs Workflow", href: "/specs-workflow" },
  { title: "Specs Order Creation", href: "/specs-order-creation" },
  { title: "Lens Cutting & Fitting", href: "/lens-cutting-workflow" },
];

export default function SidebarTest() {
  console.log("TEST - All Patient Management items:", testItems);
  
  return (
    <div className="p-4">
      <h3 className="font-bold mb-2">Patient Management Test ({testItems.length} items)</h3>
      <ul>
        {testItems.map((item, index) => {
          console.log(`TEST - Rendering item ${index}:`, item.title);
          return (
            <li key={index} className="py-1">
              • {item.title}
            </li>
          );
        })}
      </ul>
    </div>
  );
}