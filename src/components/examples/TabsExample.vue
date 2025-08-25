<template>
  <div class="space-y-12 p-8">
    <div class="mx-auto max-w-4xl">
      <h1 class="text-core-900 mb-2 text-3xl font-bold">Tabs Component Examples</h1>
      <p class="text-core-600 mb-8">
        Different variants and configurations of the Tabs component for organizing content.
      </p>

      <!-- Default Variant -->
      <section class="mb-12">
        <h2 class="text-core-800 mb-4 text-xl font-semibold">Default Variant</h2>
        <p class="text-core-600 mb-4">Classic underline style with primary border for active tab</p>

        <Tabs :tabs="basicTabs" v-model="activeTab1" variant="default">
          <template #overview>
            <div class="bg-core-25 rounded-lg p-6">
              <h3 class="text-core-800 mb-2 font-semibold">Overview Content</h3>
              <p class="text-core-600">
                This is the overview section with important information about the product or
                service.
              </p>
            </div>
          </template>

          <template #features>
            <div class="bg-core-25 rounded-lg p-6">
              <h3 class="text-core-800 mb-3 font-semibold">Key Features</h3>
              <ul class="text-core-600 list-inside list-disc space-y-1">
                <li>Feature one with detailed description</li>
                <li>Feature two that adds value</li>
                <li>Feature three for enhanced functionality</li>
              </ul>
            </div>
          </template>

          <template #pricing>
            <div class="bg-core-25 rounded-lg p-6">
              <h3 class="text-core-800 mb-2 font-semibold">Pricing Information</h3>
              <p class="text-core-600">
                Competitive pricing with flexible plans to suit your needs.
              </p>
            </div>
          </template>
        </Tabs>
      </section>

      <!-- Tonal Variant -->
      <section class="mb-12">
        <h2 class="text-core-800 mb-4 text-xl font-semibold">Tonal Variant</h2>
        <p class="text-core-600 mb-4">Subtle background with tonal active state</p>

        <Tabs :tabs="basicTabs" v-model="activeTab2" variant="tonal">
          <template #overview>
            <div class="border-core-200 rounded-lg border p-6">
              <h3 class="text-core-800 mb-2 font-semibold">Dashboard Overview</h3>
              <div class="mt-4 grid grid-cols-3 gap-4">
                <div class="bg-primary-50 rounded-lg p-4 text-center">
                  <div class="text-primary-600 text-2xl font-bold">24</div>
                  <div class="text-core-600 text-sm">Active Projects</div>
                </div>
                <div class="rounded-lg bg-green-50 p-4 text-center">
                  <div class="text-2xl font-bold text-green-600">156</div>
                  <div class="text-core-600 text-sm">Completed Tasks</div>
                </div>
                <div class="rounded-lg bg-orange-50 p-4 text-center">
                  <div class="text-2xl font-bold text-orange-600">8</div>
                  <div class="text-core-600 text-sm">Pending Reviews</div>
                </div>
              </div>
            </div>
          </template>

          <template #features>
            <div class="border-core-200 rounded-lg border p-6">
              <h3 class="text-core-800 mb-3 font-semibold">Advanced Features</h3>
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <div class="bg-primary-500 h-2 w-2 rounded-full"></div>
                  <span class="text-core-700">Real-time collaboration</span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="bg-primary-500 h-2 w-2 rounded-full"></div>
                  <span class="text-core-700">Advanced analytics</span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="bg-primary-500 h-2 w-2 rounded-full"></div>
                  <span class="text-core-700">Custom integrations</span>
                </div>
              </div>
            </div>
          </template>

          <template #pricing>
            <div class="border-core-200 rounded-lg border p-6">
              <h3 class="text-core-800 mb-3 font-semibold">Pricing Tiers</h3>
              <div class="grid grid-cols-3 gap-4">
                <div class="text-center">
                  <div class="text-core-800 font-semibold">Basic</div>
                  <div class="text-primary-600 text-2xl font-bold">$9</div>
                  <div class="text-core-600 text-sm">per month</div>
                </div>
                <div class="text-center">
                  <div class="text-core-800 font-semibold">Pro</div>
                  <div class="text-primary-600 text-2xl font-bold">$19</div>
                  <div class="text-core-600 text-sm">per month</div>
                </div>
                <div class="text-center">
                  <div class="text-core-800 font-semibold">Enterprise</div>
                  <div class="text-primary-600 text-2xl font-bold">$49</div>
                  <div class="text-core-600 text-sm">per month</div>
                </div>
              </div>
            </div>
          </template>
        </Tabs>
      </section>

      <!-- Pills Variant -->
      <section class="mb-12">
        <h2 class="text-core-800 mb-4 text-xl font-semibold">Pills Variant</h2>
        <p class="text-core-600 mb-4">Rounded pill-style tabs with solid active state</p>

        <Tabs :tabs="basicTabs" v-model="activeTab3" variant="pills">
          <template #overview>
            <div class="from-primary-50 to-primary-100 rounded-xl bg-gradient-to-br p-6">
              <h3 class="text-primary-900 mb-2 font-semibold">Welcome Overview</h3>
              <p class="text-primary-700">
                Get started with our comprehensive platform designed for modern teams.
              </p>
              <div class="mt-4 flex gap-3">
                <button
                  class="bg-primary-500 hover:bg-primary-600 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
                >
                  Get Started
                </button>
                <button
                  class="text-primary-600 hover:bg-primary-50 rounded-lg bg-white px-4 py-2 text-sm font-medium transition-colors"
                >
                  Learn More
                </button>
              </div>
            </div>
          </template>

          <template #features>
            <div class="from-primary-50 to-primary-100 rounded-xl bg-gradient-to-br p-6">
              <h3 class="text-primary-900 mb-4 font-semibold">Powerful Features</h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="rounded-lg bg-white p-4">
                  <h4 class="text-core-800 mb-2 font-medium">Smart Automation</h4>
                  <p class="text-core-600 text-sm">Automate repetitive tasks and workflows</p>
                </div>
                <div class="rounded-lg bg-white p-4">
                  <h4 class="text-core-800 mb-2 font-medium">Team Collaboration</h4>
                  <p class="text-core-600 text-sm">Work together seamlessly in real-time</p>
                </div>
                <div class="rounded-lg bg-white p-4">
                  <h4 class="text-core-800 mb-2 font-medium">Advanced Analytics</h4>
                  <p class="text-core-600 text-sm">Gain insights with detailed reporting</p>
                </div>
                <div class="rounded-lg bg-white p-4">
                  <h4 class="text-core-800 mb-2 font-medium">Secure & Reliable</h4>
                  <p class="text-core-600 text-sm">Enterprise-grade security and uptime</p>
                </div>
              </div>
            </div>
          </template>

          <template #pricing>
            <div class="from-primary-50 to-primary-100 rounded-xl bg-gradient-to-br p-6">
              <h3 class="text-primary-900 mb-4 font-semibold">Choose Your Plan</h3>
              <div class="rounded-lg bg-white p-6">
                <div class="text-center">
                  <h4 class="text-core-800 text-lg font-semibold">Professional Plan</h4>
                  <div class="text-primary-600 my-2 text-3xl font-bold">
                    $29<span class="text-core-500 text-lg">/mo</span>
                  </div>
                  <p class="text-core-600 mb-4">Everything you need for professional workflows</p>
                  <button
                    class="bg-primary-500 hover:bg-primary-600 w-full rounded-lg py-3 font-medium text-white transition-colors"
                  >
                    Start Free Trial
                  </button>
                </div>
              </div>
            </div>
          </template>
        </Tabs>
      </section>

      <!-- Object-based Tabs -->
      <section class="mb-12">
        <h2 class="text-core-800 mb-4 text-xl font-semibold">Object-based Tabs</h2>
        <p class="text-core-600 mb-4">Using objects with custom keys for tab definitions</p>

        <Tabs :tabs="objectTabs" v-model="activeTab4" variant="default" :equal="false">
          <template #user-profile>
            <div class="rounded-lg bg-blue-50 p-6">
              <h3 class="mb-2 font-semibold text-blue-900">User Profile Settings</h3>
              <p class="text-blue-700">Manage your personal information and preferences.</p>
            </div>
          </template>

          <template #account-settings>
            <div class="rounded-lg bg-green-50 p-6">
              <h3 class="mb-2 font-semibold text-green-900">Account Settings</h3>
              <p class="text-green-700">Configure your account security and billing information.</p>
            </div>
          </template>

          <template #notifications>
            <div class="rounded-lg bg-orange-50 p-6">
              <h3 class="mb-2 font-semibold text-orange-900">Notification Preferences</h3>
              <p class="text-orange-700">Choose how and when you want to receive notifications.</p>
            </div>
          </template>
        </Tabs>
      </section>

      <!-- Non-equal Width -->
      <section class="mb-12">
        <h2 class="text-core-800 mb-4 text-xl font-semibold">Variable Width Tabs</h2>
        <p class="text-core-600 mb-4">Tabs with content-based width (equal=false)</p>

        <Tabs :tabs="variableTabs" v-model="activeTab5" variant="pills" :equal="false">
          <template #home>
            <div class="bg-core-25 rounded-lg p-6">
              <h3 class="text-core-800 mb-2 font-semibold">Home</h3>
              <p class="text-core-600">Welcome to the home section.</p>
            </div>
          </template>

          <template #very-long-tab-name>
            <div class="bg-core-25 rounded-lg p-6">
              <h3 class="text-core-800 mb-2 font-semibold">Long Tab Content</h3>
              <p class="text-core-600">This tab has a very long name but works perfectly.</p>
            </div>
          </template>

          <template #docs>
            <div class="bg-core-25 rounded-lg p-6">
              <h3 class="text-core-800 mb-2 font-semibold">Documentation</h3>
              <p class="text-core-600">Find all the documentation you need here.</p>
            </div>
          </template>
        </Tabs>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import Tabs from "../common/tabs.vue"

// Sample data
const basicTabs = ["Overview", "Features", "Pricing"]

const objectTabs = [
  { title: "User Profile", key: "user-profile" },
  { title: "Account Settings", key: "account-settings" },
  { title: "Notifications", key: "notifications" },
]

const variableTabs = ["Home", "Very Long Tab Name", "Docs"]

// Active tab states for each example
const activeTab1 = ref("overview")
const activeTab2 = ref("overview")
const activeTab3 = ref("overview")
const activeTab4 = ref("user-profile")
const activeTab5 = ref("home")
</script>
