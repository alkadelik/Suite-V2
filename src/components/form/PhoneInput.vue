<template>
  <div>
    <label v-if="label" :for="name" class="text-core-800 mb-1.5 block text-sm font-medium">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div :class="containerClasses">
      <!-- Country Code Dropdown -->
      <div class="relative" ref="dropdownRef">
        <button
          type="button"
          class="flex items-center gap-1.5 border-r border-gray-200 bg-transparent px-3 py-2"
          @click.stop="showDropdown = !showDropdown"
        >
          <span class="text-base leading-none">{{ selectedCountry.flag }}</span>
          <span class="text-sm font-medium text-gray-700">{{ selectedCountry.dialCode }}</span>
          <Icon name="CaretDown" size="14" class="text-gray-500" />
        </button>

        <div
          v-if="showDropdown"
          class="absolute top-full left-0 z-50 mt-1 w-72 rounded-xl border border-gray-200 bg-white shadow-lg"
        >
          <!-- Search -->
          <div class="border-b border-gray-200 p-2">
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              placeholder="Search country..."
              class="focus:border-primary-300 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none"
            />
          </div>
          <!-- List -->
          <div class="max-h-60 overflow-y-auto py-1">
            <button
              v-for="country in filteredCountries"
              :key="country.code"
              type="button"
              class="flex w-full items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50"
              :class="{ 'bg-primary-50': country.code === selectedCountry.code }"
              @click.stop="selectCountry(country)"
            >
              <span class="text-base leading-none">{{ country.flag }}</span>
              <span class="flex-1 truncate text-left">{{ country.name }}</span>
              <span class="text-gray-500">{{ country.dialCode }}</span>
            </button>
            <p
              v-if="filteredCountries.length === 0"
              class="px-3 py-4 text-center text-sm text-gray-400"
            >
              No countries found
            </p>
          </div>
        </div>
      </div>

      <!-- Phone Input -->
      <input
        :id="name"
        :name="name"
        type="text"
        inputmode="tel"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="inputClasses"
        :value="localNumber"
        @input="handleInput"
      />
    </div>
    <div v-if="error" class="mt-1 flex items-center text-sm text-red-600">
      <Icon name="info-circle" size="16" class="mr-1 shrink-0" />
      <span>{{ error }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

import { ref, computed, watch, onMounted, nextTick } from "vue"
import { onClickOutside } from "@vueuse/core"
import Icon from "@components/Icon.vue"

interface Country {
  code: string
  dialCode: string
  flag: string
  name: string
}

interface Props {
  modelValue?: string
  label?: string
  name?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  size?: "sm" | "md" | "lg"
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Enter phone number",
  size: "md",
})

const emit = defineEmits<{
  "update:modelValue": [value: string]
}>()

// prettier-ignore
const countries: Country[] = [
  { code: "AF", dialCode: "+93", flag: "\u{1F1E6}\u{1F1EB}", name: "Afghanistan" },
  { code: "AL", dialCode: "+355", flag: "\u{1F1E6}\u{1F1F1}", name: "Albania" },
  { code: "DZ", dialCode: "+213", flag: "\u{1F1E9}\u{1F1FF}", name: "Algeria" },
  { code: "AS", dialCode: "+1684", flag: "\u{1F1E6}\u{1F1F8}", name: "American Samoa" },
  { code: "AD", dialCode: "+376", flag: "\u{1F1E6}\u{1F1E9}", name: "Andorra" },
  { code: "AO", dialCode: "+244", flag: "\u{1F1E6}\u{1F1F4}", name: "Angola" },
  { code: "AI", dialCode: "+1264", flag: "\u{1F1E6}\u{1F1EE}", name: "Anguilla" },
  { code: "AG", dialCode: "+1268", flag: "\u{1F1E6}\u{1F1EC}", name: "Antigua and Barbuda" },
  { code: "AR", dialCode: "+54", flag: "\u{1F1E6}\u{1F1F7}", name: "Argentina" },
  { code: "AM", dialCode: "+374", flag: "\u{1F1E6}\u{1F1F2}", name: "Armenia" },
  { code: "AW", dialCode: "+297", flag: "\u{1F1E6}\u{1F1FC}", name: "Aruba" },
  { code: "AU", dialCode: "+61", flag: "\u{1F1E6}\u{1F1FA}", name: "Australia" },
  { code: "AT", dialCode: "+43", flag: "\u{1F1E6}\u{1F1F9}", name: "Austria" },
  { code: "AZ", dialCode: "+994", flag: "\u{1F1E6}\u{1F1FF}", name: "Azerbaijan" },
  { code: "BS", dialCode: "+1242", flag: "\u{1F1E7}\u{1F1F8}", name: "Bahamas" },
  { code: "BH", dialCode: "+973", flag: "\u{1F1E7}\u{1F1ED}", name: "Bahrain" },
  { code: "BD", dialCode: "+880", flag: "\u{1F1E7}\u{1F1E9}", name: "Bangladesh" },
  { code: "BB", dialCode: "+1246", flag: "\u{1F1E7}\u{1F1E7}", name: "Barbados" },
  { code: "BY", dialCode: "+375", flag: "\u{1F1E7}\u{1F1FE}", name: "Belarus" },
  { code: "BE", dialCode: "+32", flag: "\u{1F1E7}\u{1F1EA}", name: "Belgium" },
  { code: "BZ", dialCode: "+501", flag: "\u{1F1E7}\u{1F1FF}", name: "Belize" },
  { code: "BJ", dialCode: "+229", flag: "\u{1F1E7}\u{1F1EF}", name: "Benin" },
  { code: "BM", dialCode: "+1441", flag: "\u{1F1E7}\u{1F1F2}", name: "Bermuda" },
  { code: "BT", dialCode: "+975", flag: "\u{1F1E7}\u{1F1F9}", name: "Bhutan" },
  { code: "BO", dialCode: "+591", flag: "\u{1F1E7}\u{1F1F4}", name: "Bolivia" },
  { code: "BA", dialCode: "+387", flag: "\u{1F1E7}\u{1F1E6}", name: "Bosnia and Herzegovina" },
  { code: "BW", dialCode: "+267", flag: "\u{1F1E7}\u{1F1FC}", name: "Botswana" },
  { code: "BR", dialCode: "+55", flag: "\u{1F1E7}\u{1F1F7}", name: "Brazil" },
  { code: "BN", dialCode: "+673", flag: "\u{1F1E7}\u{1F1F3}", name: "Brunei" },
  { code: "BG", dialCode: "+359", flag: "\u{1F1E7}\u{1F1EC}", name: "Bulgaria" },
  { code: "BF", dialCode: "+226", flag: "\u{1F1E7}\u{1F1EB}", name: "Burkina Faso" },
  { code: "BI", dialCode: "+257", flag: "\u{1F1E7}\u{1F1EE}", name: "Burundi" },
  { code: "CV", dialCode: "+238", flag: "\u{1F1E8}\u{1F1FB}", name: "Cabo Verde" },
  { code: "KH", dialCode: "+855", flag: "\u{1F1F0}\u{1F1ED}", name: "Cambodia" },
  { code: "CM", dialCode: "+237", flag: "\u{1F1E8}\u{1F1F2}", name: "Cameroon" },
  { code: "CA", dialCode: "+1", flag: "\u{1F1E8}\u{1F1E6}", name: "Canada" },
  { code: "KY", dialCode: "+1345", flag: "\u{1F1F0}\u{1F1FE}", name: "Cayman Islands" },
  { code: "CF", dialCode: "+236", flag: "\u{1F1E8}\u{1F1EB}", name: "Central African Republic" },
  { code: "TD", dialCode: "+235", flag: "\u{1F1F9}\u{1F1E9}", name: "Chad" },
  { code: "CL", dialCode: "+56", flag: "\u{1F1E8}\u{1F1F1}", name: "Chile" },
  { code: "CN", dialCode: "+86", flag: "\u{1F1E8}\u{1F1F3}", name: "China" },
  { code: "CO", dialCode: "+57", flag: "\u{1F1E8}\u{1F1F4}", name: "Colombia" },
  { code: "KM", dialCode: "+269", flag: "\u{1F1F0}\u{1F1F2}", name: "Comoros" },
  { code: "CG", dialCode: "+242", flag: "\u{1F1E8}\u{1F1EC}", name: "Congo" },
  { code: "CD", dialCode: "+243", flag: "\u{1F1E8}\u{1F1E9}", name: "Congo (Democratic Republic)" },
  { code: "CK", dialCode: "+682", flag: "\u{1F1E8}\u{1F1F0}", name: "Cook Islands" },
  { code: "CR", dialCode: "+506", flag: "\u{1F1E8}\u{1F1F7}", name: "Costa Rica" },
  { code: "HR", dialCode: "+385", flag: "\u{1F1ED}\u{1F1F7}", name: "Croatia" },
  { code: "CU", dialCode: "+53", flag: "\u{1F1E8}\u{1F1FA}", name: "Cuba" },
  { code: "CW", dialCode: "+599", flag: "\u{1F1E8}\u{1F1FC}", name: "Curaçao" },
  { code: "CY", dialCode: "+357", flag: "\u{1F1E8}\u{1F1FE}", name: "Cyprus" },
  { code: "CZ", dialCode: "+420", flag: "\u{1F1E8}\u{1F1FF}", name: "Czech Republic" },
  { code: "CI", dialCode: "+225", flag: "\u{1F1E8}\u{1F1EE}", name: "Côte d'Ivoire" },
  { code: "DK", dialCode: "+45", flag: "\u{1F1E9}\u{1F1F0}", name: "Denmark" },
  { code: "DJ", dialCode: "+253", flag: "\u{1F1E9}\u{1F1EF}", name: "Djibouti" },
  { code: "DM", dialCode: "+1767", flag: "\u{1F1E9}\u{1F1F2}", name: "Dominica" },
  { code: "DO", dialCode: "+1809", flag: "\u{1F1E9}\u{1F1F4}", name: "Dominican Republic" },
  { code: "EC", dialCode: "+593", flag: "\u{1F1EA}\u{1F1E8}", name: "Ecuador" },
  { code: "EG", dialCode: "+20", flag: "\u{1F1EA}\u{1F1EC}", name: "Egypt" },
  { code: "SV", dialCode: "+503", flag: "\u{1F1F8}\u{1F1FB}", name: "El Salvador" },
  { code: "GQ", dialCode: "+240", flag: "\u{1F1EC}\u{1F1F6}", name: "Equatorial Guinea" },
  { code: "ER", dialCode: "+291", flag: "\u{1F1EA}\u{1F1F7}", name: "Eritrea" },
  { code: "EE", dialCode: "+372", flag: "\u{1F1EA}\u{1F1EA}", name: "Estonia" },
  { code: "SZ", dialCode: "+268", flag: "\u{1F1F8}\u{1F1FF}", name: "Eswatini" },
  { code: "ET", dialCode: "+251", flag: "\u{1F1EA}\u{1F1F9}", name: "Ethiopia" },
  { code: "FJ", dialCode: "+679", flag: "\u{1F1EB}\u{1F1EF}", name: "Fiji" },
  { code: "FI", dialCode: "+358", flag: "\u{1F1EB}\u{1F1EE}", name: "Finland" },
  { code: "FR", dialCode: "+33", flag: "\u{1F1EB}\u{1F1F7}", name: "France" },
  { code: "GA", dialCode: "+241", flag: "\u{1F1EC}\u{1F1E6}", name: "Gabon" },
  { code: "GM", dialCode: "+220", flag: "\u{1F1EC}\u{1F1F2}", name: "Gambia" },
  { code: "GE", dialCode: "+995", flag: "\u{1F1EC}\u{1F1EA}", name: "Georgia" },
  { code: "DE", dialCode: "+49", flag: "\u{1F1E9}\u{1F1EA}", name: "Germany" },
  { code: "GH", dialCode: "+233", flag: "\u{1F1EC}\u{1F1ED}", name: "Ghana" },
  { code: "GI", dialCode: "+350", flag: "\u{1F1EC}\u{1F1EE}", name: "Gibraltar" },
  { code: "GR", dialCode: "+30", flag: "\u{1F1EC}\u{1F1F7}", name: "Greece" },
  { code: "GL", dialCode: "+299", flag: "\u{1F1EC}\u{1F1F1}", name: "Greenland" },
  { code: "GD", dialCode: "+1473", flag: "\u{1F1EC}\u{1F1E9}", name: "Grenada" },
  { code: "GU", dialCode: "+1671", flag: "\u{1F1EC}\u{1F1FA}", name: "Guam" },
  { code: "GT", dialCode: "+502", flag: "\u{1F1EC}\u{1F1F9}", name: "Guatemala" },
  { code: "GN", dialCode: "+224", flag: "\u{1F1EC}\u{1F1F3}", name: "Guinea" },
  { code: "GW", dialCode: "+245", flag: "\u{1F1EC}\u{1F1FC}", name: "Guinea-Bissau" },
  { code: "GY", dialCode: "+592", flag: "\u{1F1EC}\u{1F1FE}", name: "Guyana" },
  { code: "HT", dialCode: "+509", flag: "\u{1F1ED}\u{1F1F9}", name: "Haiti" },
  { code: "HN", dialCode: "+504", flag: "\u{1F1ED}\u{1F1F3}", name: "Honduras" },
  { code: "HK", dialCode: "+852", flag: "\u{1F1ED}\u{1F1F0}", name: "Hong Kong" },
  { code: "HU", dialCode: "+36", flag: "\u{1F1ED}\u{1F1FA}", name: "Hungary" },
  { code: "IS", dialCode: "+354", flag: "\u{1F1EE}\u{1F1F8}", name: "Iceland" },
  { code: "IN", dialCode: "+91", flag: "\u{1F1EE}\u{1F1F3}", name: "India" },
  { code: "ID", dialCode: "+62", flag: "\u{1F1EE}\u{1F1E9}", name: "Indonesia" },
  { code: "IR", dialCode: "+98", flag: "\u{1F1EE}\u{1F1F7}", name: "Iran" },
  { code: "IQ", dialCode: "+964", flag: "\u{1F1EE}\u{1F1F6}", name: "Iraq" },
  { code: "IE", dialCode: "+353", flag: "\u{1F1EE}\u{1F1EA}", name: "Ireland" },
  { code: "IL", dialCode: "+972", flag: "\u{1F1EE}\u{1F1F1}", name: "Israel" },
  { code: "IT", dialCode: "+39", flag: "\u{1F1EE}\u{1F1F9}", name: "Italy" },
  { code: "JM", dialCode: "+1876", flag: "\u{1F1EF}\u{1F1F2}", name: "Jamaica" },
  { code: "JP", dialCode: "+81", flag: "\u{1F1EF}\u{1F1F5}", name: "Japan" },
  { code: "JO", dialCode: "+962", flag: "\u{1F1EF}\u{1F1F4}", name: "Jordan" },
  { code: "KZ", dialCode: "+7", flag: "\u{1F1F0}\u{1F1FF}", name: "Kazakhstan" },
  { code: "KE", dialCode: "+254", flag: "\u{1F1F0}\u{1F1EA}", name: "Kenya" },
  { code: "KI", dialCode: "+686", flag: "\u{1F1F0}\u{1F1EE}", name: "Kiribati" },
  { code: "XK", dialCode: "+383", flag: "\u{1F1FD}\u{1F1F0}", name: "Kosovo" },
  { code: "KW", dialCode: "+965", flag: "\u{1F1F0}\u{1F1FC}", name: "Kuwait" },
  { code: "KG", dialCode: "+996", flag: "\u{1F1F0}\u{1F1EC}", name: "Kyrgyzstan" },
  { code: "LA", dialCode: "+856", flag: "\u{1F1F1}\u{1F1E6}", name: "Laos" },
  { code: "LV", dialCode: "+371", flag: "\u{1F1F1}\u{1F1FB}", name: "Latvia" },
  { code: "LB", dialCode: "+961", flag: "\u{1F1F1}\u{1F1E7}", name: "Lebanon" },
  { code: "LS", dialCode: "+266", flag: "\u{1F1F1}\u{1F1F8}", name: "Lesotho" },
  { code: "LR", dialCode: "+231", flag: "\u{1F1F1}\u{1F1F7}", name: "Liberia" },
  { code: "LY", dialCode: "+218", flag: "\u{1F1F1}\u{1F1FE}", name: "Libya" },
  { code: "LI", dialCode: "+423", flag: "\u{1F1F1}\u{1F1EE}", name: "Liechtenstein" },
  { code: "LT", dialCode: "+370", flag: "\u{1F1F1}\u{1F1F9}", name: "Lithuania" },
  { code: "LU", dialCode: "+352", flag: "\u{1F1F1}\u{1F1FA}", name: "Luxembourg" },
  { code: "MO", dialCode: "+853", flag: "\u{1F1F2}\u{1F1F4}", name: "Macao" },
  { code: "MG", dialCode: "+261", flag: "\u{1F1F2}\u{1F1EC}", name: "Madagascar" },
  { code: "MW", dialCode: "+265", flag: "\u{1F1F2}\u{1F1FC}", name: "Malawi" },
  { code: "MY", dialCode: "+60", flag: "\u{1F1F2}\u{1F1FE}", name: "Malaysia" },
  { code: "MV", dialCode: "+960", flag: "\u{1F1F2}\u{1F1FB}", name: "Maldives" },
  { code: "ML", dialCode: "+223", flag: "\u{1F1F2}\u{1F1F1}", name: "Mali" },
  { code: "MT", dialCode: "+356", flag: "\u{1F1F2}\u{1F1F9}", name: "Malta" },
  { code: "MH", dialCode: "+692", flag: "\u{1F1F2}\u{1F1ED}", name: "Marshall Islands" },
  { code: "MR", dialCode: "+222", flag: "\u{1F1F2}\u{1F1F7}", name: "Mauritania" },
  { code: "MU", dialCode: "+230", flag: "\u{1F1F2}\u{1F1FA}", name: "Mauritius" },
  { code: "MX", dialCode: "+52", flag: "\u{1F1F2}\u{1F1FD}", name: "Mexico" },
  { code: "FM", dialCode: "+691", flag: "\u{1F1EB}\u{1F1F2}", name: "Micronesia" },
  { code: "MD", dialCode: "+373", flag: "\u{1F1F2}\u{1F1E9}", name: "Moldova" },
  { code: "MC", dialCode: "+377", flag: "\u{1F1F2}\u{1F1E8}", name: "Monaco" },
  { code: "MN", dialCode: "+976", flag: "\u{1F1F2}\u{1F1F3}", name: "Mongolia" },
  { code: "ME", dialCode: "+382", flag: "\u{1F1F2}\u{1F1EA}", name: "Montenegro" },
  { code: "MS", dialCode: "+1664", flag: "\u{1F1F2}\u{1F1F8}", name: "Montserrat" },
  { code: "MA", dialCode: "+212", flag: "\u{1F1F2}\u{1F1E6}", name: "Morocco" },
  { code: "MZ", dialCode: "+258", flag: "\u{1F1F2}\u{1F1FF}", name: "Mozambique" },
  { code: "MM", dialCode: "+95", flag: "\u{1F1F2}\u{1F1F2}", name: "Myanmar" },
  { code: "NA", dialCode: "+264", flag: "\u{1F1F3}\u{1F1E6}", name: "Namibia" },
  { code: "NR", dialCode: "+674", flag: "\u{1F1F3}\u{1F1F7}", name: "Nauru" },
  { code: "NP", dialCode: "+977", flag: "\u{1F1F3}\u{1F1F5}", name: "Nepal" },
  { code: "NL", dialCode: "+31", flag: "\u{1F1F3}\u{1F1F1}", name: "Netherlands" },
  { code: "NZ", dialCode: "+64", flag: "\u{1F1F3}\u{1F1FF}", name: "New Zealand" },
  { code: "NI", dialCode: "+505", flag: "\u{1F1F3}\u{1F1EE}", name: "Nicaragua" },
  { code: "NE", dialCode: "+227", flag: "\u{1F1F3}\u{1F1EA}", name: "Niger" },
  { code: "NG", dialCode: "+234", flag: "\u{1F1F3}\u{1F1EC}", name: "Nigeria" },
  { code: "KP", dialCode: "+850", flag: "\u{1F1F0}\u{1F1F5}", name: "North Korea" },
  { code: "MK", dialCode: "+389", flag: "\u{1F1F2}\u{1F1F0}", name: "North Macedonia" },
  { code: "NO", dialCode: "+47", flag: "\u{1F1F3}\u{1F1F4}", name: "Norway" },
  { code: "OM", dialCode: "+968", flag: "\u{1F1F4}\u{1F1F2}", name: "Oman" },
  { code: "PK", dialCode: "+92", flag: "\u{1F1F5}\u{1F1F0}", name: "Pakistan" },
  { code: "PW", dialCode: "+680", flag: "\u{1F1F5}\u{1F1FC}", name: "Palau" },
  { code: "PS", dialCode: "+970", flag: "\u{1F1F5}\u{1F1F8}", name: "Palestine" },
  { code: "PA", dialCode: "+507", flag: "\u{1F1F5}\u{1F1E6}", name: "Panama" },
  { code: "PG", dialCode: "+675", flag: "\u{1F1F5}\u{1F1EC}", name: "Papua New Guinea" },
  { code: "PY", dialCode: "+595", flag: "\u{1F1F5}\u{1F1FE}", name: "Paraguay" },
  { code: "PE", dialCode: "+51", flag: "\u{1F1F5}\u{1F1EA}", name: "Peru" },
  { code: "PH", dialCode: "+63", flag: "\u{1F1F5}\u{1F1ED}", name: "Philippines" },
  { code: "PL", dialCode: "+48", flag: "\u{1F1F5}\u{1F1F1}", name: "Poland" },
  { code: "PT", dialCode: "+351", flag: "\u{1F1F5}\u{1F1F9}", name: "Portugal" },
  { code: "PR", dialCode: "+1787", flag: "\u{1F1F5}\u{1F1F7}", name: "Puerto Rico" },
  { code: "QA", dialCode: "+974", flag: "\u{1F1F6}\u{1F1E6}", name: "Qatar" },
  { code: "RO", dialCode: "+40", flag: "\u{1F1F7}\u{1F1F4}", name: "Romania" },
  { code: "RU", dialCode: "+7", flag: "\u{1F1F7}\u{1F1FA}", name: "Russia" },
  { code: "RW", dialCode: "+250", flag: "\u{1F1F7}\u{1F1FC}", name: "Rwanda" },
  { code: "KN", dialCode: "+1869", flag: "\u{1F1F0}\u{1F1F3}", name: "Saint Kitts and Nevis" },
  { code: "LC", dialCode: "+1758", flag: "\u{1F1F1}\u{1F1E8}", name: "Saint Lucia" },
  { code: "VC", dialCode: "+1784", flag: "\u{1F1FB}\u{1F1E8}", name: "Saint Vincent and the Grenadines" },
  { code: "WS", dialCode: "+685", flag: "\u{1F1FC}\u{1F1F8}", name: "Samoa" },
  { code: "SM", dialCode: "+378", flag: "\u{1F1F8}\u{1F1F2}", name: "San Marino" },
  { code: "ST", dialCode: "+239", flag: "\u{1F1F8}\u{1F1F9}", name: "São Tomé and Príncipe" },
  { code: "SA", dialCode: "+966", flag: "\u{1F1F8}\u{1F1E6}", name: "Saudi Arabia" },
  { code: "SN", dialCode: "+221", flag: "\u{1F1F8}\u{1F1F3}", name: "Senegal" },
  { code: "RS", dialCode: "+381", flag: "\u{1F1F7}\u{1F1F8}", name: "Serbia" },
  { code: "SC", dialCode: "+248", flag: "\u{1F1F8}\u{1F1E8}", name: "Seychelles" },
  { code: "SL", dialCode: "+232", flag: "\u{1F1F8}\u{1F1F1}", name: "Sierra Leone" },
  { code: "SG", dialCode: "+65", flag: "\u{1F1F8}\u{1F1EC}", name: "Singapore" },
  { code: "SK", dialCode: "+421", flag: "\u{1F1F8}\u{1F1F0}", name: "Slovakia" },
  { code: "SI", dialCode: "+386", flag: "\u{1F1F8}\u{1F1EE}", name: "Slovenia" },
  { code: "SB", dialCode: "+677", flag: "\u{1F1F8}\u{1F1E7}", name: "Solomon Islands" },
  { code: "SO", dialCode: "+252", flag: "\u{1F1F8}\u{1F1F4}", name: "Somalia" },
  { code: "ZA", dialCode: "+27", flag: "\u{1F1FF}\u{1F1E6}", name: "South Africa" },
  { code: "KR", dialCode: "+82", flag: "\u{1F1F0}\u{1F1F7}", name: "South Korea" },
  { code: "SS", dialCode: "+211", flag: "\u{1F1F8}\u{1F1F8}", name: "South Sudan" },
  { code: "ES", dialCode: "+34", flag: "\u{1F1EA}\u{1F1F8}", name: "Spain" },
  { code: "LK", dialCode: "+94", flag: "\u{1F1F1}\u{1F1F0}", name: "Sri Lanka" },
  { code: "SD", dialCode: "+249", flag: "\u{1F1F8}\u{1F1E9}", name: "Sudan" },
  { code: "SR", dialCode: "+597", flag: "\u{1F1F8}\u{1F1F7}", name: "Suriname" },
  { code: "SE", dialCode: "+46", flag: "\u{1F1F8}\u{1F1EA}", name: "Sweden" },
  { code: "CH", dialCode: "+41", flag: "\u{1F1E8}\u{1F1ED}", name: "Switzerland" },
  { code: "SY", dialCode: "+963", flag: "\u{1F1F8}\u{1F1FE}", name: "Syria" },
  { code: "TW", dialCode: "+886", flag: "\u{1F1F9}\u{1F1FC}", name: "Taiwan" },
  { code: "TJ", dialCode: "+992", flag: "\u{1F1F9}\u{1F1EF}", name: "Tajikistan" },
  { code: "TZ", dialCode: "+255", flag: "\u{1F1F9}\u{1F1FF}", name: "Tanzania" },
  { code: "TH", dialCode: "+66", flag: "\u{1F1F9}\u{1F1ED}", name: "Thailand" },
  { code: "TL", dialCode: "+670", flag: "\u{1F1F9}\u{1F1F1}", name: "Timor-Leste" },
  { code: "TG", dialCode: "+228", flag: "\u{1F1F9}\u{1F1EC}", name: "Togo" },
  { code: "TO", dialCode: "+676", flag: "\u{1F1F9}\u{1F1F4}", name: "Tonga" },
  { code: "TT", dialCode: "+1868", flag: "\u{1F1F9}\u{1F1F9}", name: "Trinidad and Tobago" },
  { code: "TN", dialCode: "+216", flag: "\u{1F1F9}\u{1F1F3}", name: "Tunisia" },
  { code: "TR", dialCode: "+90", flag: "\u{1F1F9}\u{1F1F7}", name: "Turkey" },
  { code: "TM", dialCode: "+993", flag: "\u{1F1F9}\u{1F1F2}", name: "Turkmenistan" },
  { code: "TC", dialCode: "+1649", flag: "\u{1F1F9}\u{1F1E8}", name: "Turks and Caicos Islands" },
  { code: "TV", dialCode: "+688", flag: "\u{1F1F9}\u{1F1FB}", name: "Tuvalu" },
  { code: "UG", dialCode: "+256", flag: "\u{1F1FA}\u{1F1EC}", name: "Uganda" },
  { code: "UA", dialCode: "+380", flag: "\u{1F1FA}\u{1F1E6}", name: "Ukraine" },
  { code: "AE", dialCode: "+971", flag: "\u{1F1E6}\u{1F1EA}", name: "United Arab Emirates" },
  { code: "GB", dialCode: "+44", flag: "\u{1F1EC}\u{1F1E7}", name: "United Kingdom" },
  { code: "US", dialCode: "+1", flag: "\u{1F1FA}\u{1F1F8}", name: "United States" },
  { code: "UY", dialCode: "+598", flag: "\u{1F1FA}\u{1F1FE}", name: "Uruguay" },
  { code: "UZ", dialCode: "+998", flag: "\u{1F1FA}\u{1F1FF}", name: "Uzbekistan" },
  { code: "VU", dialCode: "+678", flag: "\u{1F1FB}\u{1F1FA}", name: "Vanuatu" },
  { code: "VE", dialCode: "+58", flag: "\u{1F1FB}\u{1F1EA}", name: "Venezuela" },
  { code: "VN", dialCode: "+84", flag: "\u{1F1FB}\u{1F1F3}", name: "Vietnam" },
  { code: "YE", dialCode: "+967", flag: "\u{1F1FE}\u{1F1EA}", name: "Yemen" },
  { code: "ZM", dialCode: "+260", flag: "\u{1F1FF}\u{1F1F2}", name: "Zambia" },
  { code: "ZW", dialCode: "+263", flag: "\u{1F1FF}\u{1F1FC}", name: "Zimbabwe" },
]

const showDropdown = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)
const searchQuery = ref("")
const defaultCountry = countries.find((c) => c.code === "NG") || countries[0]
const selectedCountry = ref(defaultCountry)
const localNumber = ref("")

const filteredCountries = computed(() => {
  if (!searchQuery.value) return countries
  const q = searchQuery.value.toLowerCase()
  return countries.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.dialCode.includes(q) ||
      c.code.toLowerCase().includes(q),
  )
})

// Focus search input when dropdown opens
watch(showDropdown, async (open) => {
  if (open) {
    searchQuery.value = ""
    await nextTick()
    searchInputRef.value?.focus()
  }
})

const detectCountry = (value: string): { country: Country; local: string } => {
  if (!value) return { country: defaultCountry, local: "" }
  const clean = value.replace(/[^\d+]/g, "")
  // Sort by dialCode length desc so longer codes match first (e.g. +234 before +2)
  const sorted = [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length)
  for (const c of sorted) {
    if (clean.startsWith(c.dialCode)) {
      return { country: c, local: clean.slice(c.dialCode.length) }
    }
  }
  return { country: defaultCountry, local: clean.replace(/^\+/, "") }
}

const parseIncoming = () => {
  if (props.modelValue) {
    const { country, local } = detectCountry(props.modelValue)
    selectedCountry.value = country
    localNumber.value = local.startsWith("0") ? local.substring(1) : local
  }
}

let isInternalUpdate = false

onMounted(parseIncoming)
watch(
  () => props.modelValue,
  () => {
    if (!isInternalUpdate) parseIncoming()
  },
)

const selectCountry = (country: Country) => {
  selectedCountry.value = country
  showDropdown.value = false
  emitValue(localNumber.value)
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value.replace(/[^\d]/g, "")
  if (value.startsWith("0")) value = value.substring(1)
  localNumber.value = value
  target.value = value
  emitValue(value)
}

const emitValue = (local: string) => {
  isInternalUpdate = true
  if (local) {
    emit("update:modelValue", `${selectedCountry.value.dialCode}${local}`)
  } else {
    emit("update:modelValue", "")
  }
  void nextTick(() => {
    isInternalUpdate = false
  })
}

// Close dropdown on outside click
onClickOutside(dropdownRef, () => {
  showDropdown.value = false
})

const containerClasses = computed(() => {
  return "flex items-center rounded-xl border bg-core-25 border-core-50 focus-within:border-primary-300 focus-within:ring-1 focus-within:ring-primary-300"
})

const inputClasses = computed(() => {
  const sizeClasses = {
    sm: "h-10 text-sm px-3",
    md: "h-11 text-sm px-3",
    lg: "h-12 text-base px-4",
  }
  return `flex-1 bg-transparent outline-none ${sizeClasses[props.size]}`
})
</script>
