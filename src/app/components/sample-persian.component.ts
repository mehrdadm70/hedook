import { Component } from '@angular/core';

@Component({
  selector: 'app-sample-persian',
  template: `
    <div class="min-h-screen bg-gray-50 p-4">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <header class="text-center mb-8">
          <h1 class="text-4xl font-bold text-gray-800 font-vazir mb-4">
            نمونه استفاده از Tailwind با فونت وزیر
          </h1>
          <p class="text-lg text-gray-600 font-vazir">
            این یک نمونه از استفاده ترکیبی Tailwind CSS و فونت فارسی وزیر است
          </p>
        </header>

        <!-- Cards Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <h3 class="text-xl font-semibold text-primary mb-3 font-vazir">کارت اول</h3>
            <p class="text-gray-600 font-vazir leading-relaxed">
              این متن با فونت وزیر نوشته شده است و از کلاس‌های Tailwind برای استایل‌دهی استفاده می‌کند.
            </p>
            <button class="mt-4 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors font-vazir">
              دکمه نمونه
            </button>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <h3 class="text-xl font-semibold text-accent mb-3 font-vazir">کارت دوم</h3>
            <p class="text-gray-600 font-vazir leading-relaxed">
              استفاده از رنگ‌های سفارشی که در تنظیمات Tailwind تعریف کرده‌ایم.
            </p>
            <button class="mt-4 bg-accent text-white px-4 py-2 rounded-md hover:bg-accent-dark transition-colors font-vazir">
              دکمه رنگی
            </button>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <h3 class="text-xl font-semibold text-success mb-3 font-vazir">کارت سوم</h3>
            <p class="text-gray-600 font-vazir leading-relaxed">
              نمونه‌ای از طراحی ریسپانسیو با استفاده از کلاس‌های Tailwind.
            </p>
            <button class="mt-4 bg-success text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors font-vazir">
              دکمه سبز
            </button>
          </div>
        </div>

        <!-- Typography Examples -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-4 font-vazir">نمونه‌های تایپوگرافی</h2>
          
          <div class="space-y-4">
            <p class="text-xs text-gray-500 font-vazir">متن بسیار کوچک (text-xs)</p>
            <p class="text-sm text-gray-600 font-vazir">متن کوچک (text-sm)</p>
            <p class="text-base text-gray-700 font-vazir">متن معمولی (text-base)</p>
            <p class="text-lg text-gray-800 font-vazir">متن بزرگ (text-lg)</p>
            <p class="text-xl text-gray-900 font-vazir font-medium">متن بزرگ‌تر (text-xl)</p>
            <p class="text-2xl text-primary font-vazir font-semibold">متن خیلی بزرگ (text-2xl)</p>
            <p class="text-3xl text-accent font-vazir font-bold">متن بسیار بزرگ (text-3xl)</p>
          </div>
        </div>

        <!-- RTL Layout Example -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-4 font-vazir">نمونه چیدمان راست به چپ</h2>
          
          <div class="flex flex-col sm:flex-row gap-4">
            <div class="flex-1 bg-gray-100 p-4 rounded-md">
              <h3 class="font-semibold text-gray-800 mb-2 font-vazir">بخش اول</h3>
              <p class="text-gray-600 font-vazir">
                این متن در بخش اول قرار دارد و با چیدمان راست به چپ نمایش داده می‌شود.
              </p>
            </div>
            
            <div class="flex-1 bg-gray-100 p-4 rounded-md">
              <h3 class="font-semibold text-gray-800 mb-2 font-vazir">بخش دوم</h3>
              <p class="text-gray-600 font-vazir">
                این متن در بخش دوم قرار دارد و همچنین با فونت وزیر نمایش داده می‌شود.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  standalone: true
})
export class SamplePersianComponent {}