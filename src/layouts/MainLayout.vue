<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Navigation -->
    <nav class="bg-white shadow">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 justify-between">
          <div class="flex">
            <div class="flex flex-shrink-0 items-center">
              <router-link to="/" class="text-xl font-bold text-gray-900"> Suite V2 </router-link>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link
                to="/orders"
                class="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                active-class="border-indigo-500 text-gray-900"
              >
                Orders
              </router-link>
              <router-link
                to="/inventory"
                class="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                active-class="border-indigo-500 text-gray-900"
              >
                Inventory
              </router-link>
              <router-link
                to="/customers"
                class="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                active-class="border-indigo-500 text-gray-900"
              >
                Customers
              </router-link>
              <router-link
                to="/popups"
                class="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                active-class="border-indigo-500 text-gray-900"
              >
                Popups
              </router-link>
            </div>
          </div>

          <!-- Profile dropdown -->
          <div class="flex items-center">
            <div class="relative ml-3">
              <div>
                <button
                  type="button"
                  class="flex rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none"
                  id="user-menu-button"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <span class="sr-only">Open user menu</span>
                  <div class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500">
                    <span class="text-sm leading-none font-medium text-white">U</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      <div class="sm:hidden">
        <div class="space-y-1 pt-2 pb-3">
          <router-link
            to="/orders"
            class="block border-l-4 border-transparent py-2 pr-4 pl-3 text-base font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
            active-class="bg-indigo-50 border-indigo-500 text-indigo-700"
          >
            Orders
          </router-link>
          <router-link
            to="/inventory"
            class="block border-l-4 border-transparent py-2 pr-4 pl-3 text-base font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
            active-class="bg-indigo-50 border-indigo-500 text-indigo-700"
          >
            Inventory
          </router-link>
          <router-link
            to="/customers"
            class="block border-l-4 border-transparent py-2 pr-4 pl-3 text-base font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
            active-class="bg-indigo-50 border-indigo-500 text-indigo-700"
          >
            Customers
          </router-link>
          <router-link
            to="/popups"
            class="block border-l-4 border-transparent py-2 pr-4 pl-3 text-base font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
            active-class="bg-indigo-50 border-indigo-500 text-indigo-700"
          >
            Popups
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Page content -->
    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
// Main layout for authenticated pages
</script>
