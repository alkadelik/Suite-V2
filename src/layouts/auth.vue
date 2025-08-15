<template>
	<div class="flex h-screen">
		<!-- Left Side -->
		<div class="w-[45%] hidden lg:block relative">
			<div class="relative w-full h-full overflow-hidden">
				<img
					src="../assets/images/jpegs/auth-layout-image.jpeg"
					alt="gradient background image"
					class="w-full h-full object-cover"
				/>
			</div>
		</div>

		<!-- Right Side -->
		<div class="flex-1 overflow-auto p-4 flex items-center justify-center">
			<div class="w-full">
				<router-view />
			</div>
		</div>
	</div>
</template>
