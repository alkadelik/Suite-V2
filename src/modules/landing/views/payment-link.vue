<script setup lang="ts"></script>

<template>
  <div class="min-h-screen">
    <header
      class="border-core-200 sticky top-0 z-50 flex items-center justify-between border-b bg-white p-4"
    >
      <RouterLink to="/">
        <img src="/LYW.svg" alt="Leyyow Logo" class="h-6" />
      </RouterLink>
      <RouterLink to="/signup" class="text-primary-600 text-sm font-semibold underline">
        Create payment links
      </RouterLink>
    </header>

    <div class="font-outfit mx-auto max-w-[600px] p-4 py-8">
      <div class="mb-6">
        <h2 class="font-serif text-xl font-semibold md:text-2xl">Order Details</h2>
        <p class="text-sm md:text-base">
          Take a quick look at your order, then hit 'Pay' when you're ready.
        </p>
      </div>

      <div class="flex h-24 flex-col items-start justify-end rounded-lg bg-black p-4">
        <img src="/images/logos/leyyow-logo-2.svg?url" alt="bg-image" class="h-6" />
      </div>

      <!-- Greeting -->
      <h6 class="mt-6 mb-0 text-base font-bold">Hello [Merchant_name],</h6>

      <!-- Body -->
      <p class="mt-4 mb-0 text-sm leading-normal">
        You've just received a <span class="font-bold">₦[order_Amount]</span> payment for order
        <span class="font-bold">#[Order Reference]</span>. Below are the details:
      </p>

      <!-- Customer Details -->
      <div class="border-core-300 mt-5 rounded-lg border bg-[#fbfbfb] p-3">
        <div class="mb-2 text-base font-bold">Customer Details</div>
        <div class="flex justify-between py-1.5 text-sm">
          <span>Name:</span>
          <span class="font-medium">Abdulraheem Abdulsobur</span>
        </div>
        <div class="flex justify-between py-1.5 text-sm">
          <span>Contact:</span>
          <span class="font-medium">+234 8082826122</span>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="border-core-300 mt-5 rounded-lg border bg-[#fbfbfb] p-3">
        <div class="mb-3 text-base font-bold">Order Summary</div>

        <!-- Product Items -->
        <div class="space-y-3">
          <!-- Product 1 -->
          <div class="flex gap-2.5">
            <img
              src="https://res.cloudinary.com/dwwxvzind/image/upload/v1757112704/Icon_Box_keqfxr.png"
              alt="Product 1"
              class="h-[52px] w-[52px] rounded"
            />
            <div class="flex-1 text-[13px]">
              <p class="m-0">23 Seamless Tank <span class="text-primary-700">(x4)</span></p>
              <p class="text-core-600 m-0">Large | Blue</p>
            </div>
            <div class="text-right text-[13px]">
              <span class="text-core-400 mr-1 line-through">₦15,750</span> ₦12,750
            </div>
          </div>

          <!-- Product 2 -->
          <div class="flex gap-2.5">
            <img
              src="https://res.cloudinary.com/dwwxvzind/image/upload/v1757112704/Icon_Box_keqfxr.png"
              alt="Product 2"
              class="h-[52px] w-[52px] rounded"
            />
            <div class="flex-1 text-[13px]">
              <p class="m-0">Active Jacket <span class="text-primary-700">(x4)</span></p>
              <p class="text-core-600 m-0">Small | Brown</p>
            </div>
            <div class="text-right text-[13px]">
              <span class="text-core-400 mr-1 line-through">₦25,000</span> ₦20,000
            </div>
          </div>
        </div>

        <!-- Totals -->
        <div class="mt-5 text-sm">
          <div class="border-t border-dashed border-[#c4dbd5]"></div>
          <div class="flex justify-between py-3">
            <span>Subtotal (3 items):</span>
            <span class="font-semibold">
              <span class="text-core-400 mr-1 line-through">₦40,750</span> ₦32,750
            </span>
          </div>
          <div class="flex justify-between py-3">
            <span>Shipping (Badagry):</span>
            <span class="font-semibold">₦5,000</span>
          </div>
          <div class="border-b border-dashed border-[#c4dbd5]"></div>
          <div class="flex justify-between pt-3 text-base">
            <span class="font-semibold">Total Amount:</span>
            <span class="font-bold">₦37,750</span>
          </div>
          <div class="flex justify-between py-3">
            <span>Payment Status:</span>
            <span
              class="text-success-700 border-success-200 bg-success-50 rounded-3xl border px-2.5 py-1.5 text-sm"
            >
              Paid (Transfer)
            </span>
          </div>
        </div>
      </div>

      <!-- Shipping Summary -->
      <div class="border-core-300 mt-5 rounded-lg border bg-[#fbfbfb] p-3">
        <div class="mb-3 text-base font-bold">Shipping Summary</div>
        <div class="flex justify-between py-1.5 text-sm">
          <span>Company:</span>
          <span class="font-medium">GOKADA</span>
        </div>
        <div class="flex justify-between py-1.5 text-sm">
          <span>Tracking Link:</span>
          <span class="font-medium">
            <a href="/#" class="text-warning-700">(Click here →)</a>
          </span>
        </div>
        <div
          class="bg-warning-50 border-warning-200 mt-2 border-t border-b py-2 text-center text-[13px]"
        >
          Shipping is provided by
          <img
            src="https://res.cloudinary.com/do2uxmtsx/image/upload/v1752203568/shipbubble_vgrkbu.png"
            alt="Shipbubble"
            class="inline h-5 align-middle"
          />
        </div>
        <div class="pt-3 text-xs">
          For help with your delivery, please reach out to Shipbubble at
          <a href="mailto:email@shipbubble.com" class="text-warning-700">email@shipbubble.com</a>.
          Leyyow does not handle delivery directly.
        </div>
      </div>

      <!-- Contact Section -->
      <div class="text-core-800 mt-5 rounded-lg bg-[#f2f2f2] p-4 text-center text-xs">
        <p class="mb-3">
          For any feedback or enquiries, get in touch with us at
          <a href="mailto:hello@leyyow.com" class="text-core-700 underline">hello@leyyow.com</a>
        </p>
        <img
          src="https://res.cloudinary.com/dwwxvzind/image/upload/v1755625250/leyyow-logo-1_mh9vrh.png"
          alt="leyyow logo"
          class="mx-auto w-[100px]"
        />
      </div>
    </div>
  </div>
</template>
