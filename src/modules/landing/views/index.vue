<template>
  <!-- Hero section -->
  <div class="relative bg-white">
    <div class="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
      <div class="text-center">
        <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
          <span class="block">Welcome to</span>
          <span class="block text-indigo-600">Suite V2</span>
        </h1>
        <p class="mx-auto mt-6 max-w-lg text-xl text-gray-500 sm:max-w-3xl">
          The ultimate business management platform designed to streamline your operations, manage
          your inventory, track orders, and engage with customers seamlessly.
        </p>
        <div class="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
          <div class="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
            <router-link
              to="/register"
              class="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 sm:px-8"
            >
              Get started
            </router-link>
            <router-link
              to="/login"
              class="flex items-center justify-center rounded-md border border-transparent bg-indigo-100 px-4 py-3 text-base font-medium text-indigo-700 shadow-sm hover:bg-indigo-200 sm:px-8"
            >
              Sign in
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Features section -->
  <div class="bg-gray-50 py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="mx-auto max-w-2xl lg:text-center">
        <h2 class="text-base leading-7 font-semibold text-indigo-600">Everything you need</h2>
        <p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Manage your business with ease
        </p>
        <p class="mt-6 text-lg leading-8 text-gray-600">
          Our comprehensive suite of tools helps you manage every aspect of your business from a
          single, intuitive platform.
        </p>
      </div>
      <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
        <dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
          <div class="flex flex-col">
            <dt class="flex items-center gap-x-3 text-base leading-7 font-semibold text-gray-900">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                <svg
                  class="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3-3h0 1.5M15 12h0 1.5m-6 3v2.25a2.25 2.25 0 002.25 2.25h13.5a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v13.5z"
                  />
                </svg>
              </div>
              Order Management
            </dt>
            <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
              <p class="flex-auto">
                Track and manage all your orders in one place. From order creation to fulfillment,
                stay on top of your business operations.
              </p>
            </dd>
          </div>
          <div class="flex flex-col">
            <dt class="flex items-center gap-x-3 text-base leading-7 font-semibold text-gray-900">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                <svg
                  class="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                  />
                </svg>
              </div>
              Inventory Control
            </dt>
            <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
              <p class="flex-auto">
                Keep track of your stock levels, manage product information, and receive alerts when
                inventory runs low.
              </p>
            </dd>
          </div>
          <div class="flex flex-col">
            <dt class="flex items-center gap-x-3 text-base leading-7 font-semibold text-gray-900">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                <svg
                  class="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                  />
                </svg>
              </div>
              Customer Management
            </dt>
            <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
              <p class="flex-auto">
                Build and maintain strong relationships with your customers through comprehensive
                customer management tools.
              </p>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </div>

  <section class="p-4">
    <TestTable />
  </section>
</template>

<script setup lang="ts">
import TestTable from "@components/TestTable.vue"

// Home page content
</script>
