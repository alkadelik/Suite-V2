<template>
  <DataTable
    :data="INVENTORY_DATA"
    :columns="INVENTORY_COLUMNS"
    title="Inventory Management"
    :loading="false"
    :showPagination="true"
    :itemsPerPage="5"
    :perPageOptions="[5, 10, 20, 50]"
    :enableRowSelection="true"
    @onRowClick="handleRowClick"
    @onRowSelectionChange="handleSelectionChange"
  >
    <template #cell:status="{ value }">
      <span
        :class="{
          'text-red-500': value === 'Out of Stock',
          'text-yellow-500': value === 'Low Stock',
          'text-green-500': value === 'In Stock',
        }"
      >
        {{ value }}
      </span>
    </template>
  </DataTable>
</template>
<script setup lang="ts">
import DataTable, { TableColumn } from "@components/DataTable.vue"

const INVENTORY_DATA = [
  {
    id: 1,
    sku: "INV-001",
    name: "Wireless Bluetooth Headphones",
    category: "Electronics",
    brand: "AudioTech",
    quantity: 150,
    price: 89.99,
    cost: 45,
    status: "In Stock",
    supplier: "TechSupply Co.",
    location: "Warehouse A",
    lastUpdated: "2024-03-15T10:30:00Z",
    reorderLevel: 25,
    description: "High-quality wireless headphones with noise cancellation",
  },
  {
    id: 2,
    sku: "INV-002",
    name: "Gaming Mechanical Keyboard",
    category: "Electronics",
    brand: "GamePro",
    quantity: 8,
    price: 159.99,
    cost: 85,
    status: "Low Stock",
    supplier: "Gaming Gear Ltd.",
    location: "Warehouse B",
    lastUpdated: "2024-03-14T14:20:00Z",
    reorderLevel: 15,
    description: "RGB mechanical keyboard with cherry MX switches",
  },
  {
    id: 3,
    sku: "INV-003",
    name: "Stainless Steel Water Bottle",
    category: "Home & Kitchen",
    brand: "HydroLife",
    quantity: 0,
    price: 24.99,
    cost: 12.5,
    status: "Out of Stock",
    supplier: "Kitchen Essentials",
    location: "Warehouse A",
    lastUpdated: "2024-03-13T09:15:00Z",
    reorderLevel: 50,
    description: "Insulated water bottle keeps drinks cold for 24 hours",
  },
  {
    id: 4,
    sku: "INV-004",
    name: "Organic Cotton T-Shirt",
    category: "Clothing",
    brand: "EcoWear",
    quantity: 245,
    price: 29.99,
    cost: 15,
    status: "In Stock",
    supplier: "Sustainable Textiles",
    location: "Warehouse C",
    lastUpdated: "2024-03-16T11:45:00Z",
    reorderLevel: 30,
    description: "100% organic cotton, available in multiple colors",
  },
  {
    id: 5,
    sku: "INV-005",
    name: "Smart Fitness Tracker",
    category: "Electronics",
    brand: "FitTech",
    quantity: 67,
    price: 199.99,
    cost: 120,
    status: "In Stock",
    supplier: "Health Tech Solutions",
    location: "Warehouse B",
    lastUpdated: "2024-03-15T16:30:00Z",
    reorderLevel: 20,
    description: "Advanced fitness tracking with heart rate monitor",
  },
  {
    id: 6,
    sku: "INV-006",
    name: "Ceramic Coffee Mug Set",
    category: "Home & Kitchen",
    brand: "BrewMaster",
    quantity: 89,
    price: 39.99,
    cost: 18,
    status: "In Stock",
    supplier: "Kitchen Essentials",
    location: "Warehouse A",
    lastUpdated: "2024-03-14T08:20:00Z",
    reorderLevel: 25,
    description: "Set of 4 premium ceramic mugs with gift box",
  },
  {
    id: 7,
    sku: "INV-007",
    name: "Professional Yoga Mat",
    category: "Sports & Fitness",
    brand: "ZenFlow",
    quantity: 12,
    price: 79.99,
    cost: 35,
    status: "Low Stock",
    supplier: "Fitness Pro",
    location: "Warehouse C",
    lastUpdated: "2024-03-16T13:10:00Z",
    reorderLevel: 15,
    description: "Non-slip yoga mat with alignment guides",
  },
  {
    id: 8,
    sku: "INV-008",
    name: "Wireless Phone Charger",
    category: "Electronics",
    brand: "ChargeTech",
    quantity: 134,
    price: 49.99,
    cost: 22.5,
    status: "In Stock",
    supplier: "TechSupply Co.",
    location: "Warehouse B",
    lastUpdated: "2024-03-15T12:00:00Z",
    reorderLevel: 30,
    description: "Fast wireless charging pad compatible with all devices",
  },
]

const INVENTORY_COLUMNS: TableColumn[] = [
  {
    header: "Product",
    accessor: "name",
    class: "min-w-[200px]",
  },
  { header: "SKU", accessor: "sku", class: "font-mono text-xs" },
  { header: "Category", accessor: "category" },
  { header: "Brand", accessor: "brand", class: "uppercase" },
  { header: "Quantity", accessor: "quantity", class: "text-right font-bold" },
  { header: "Price", accessor: "price", class: "text-right text-green-600 font-medium" },
  { header: "Status", accessor: "status", class: "text-center" },
  { header: "Location", accessor: "location" },
]

// Event handlers
const handleRowClick = (row: Record<string, unknown>) => {
  console.log("Row clicked:", row)
}

const handleSelectionChange = (selectedRows: Record<string, unknown>[]) => {
  console.log("Selection changed:", selectedRows)
}
</script>
