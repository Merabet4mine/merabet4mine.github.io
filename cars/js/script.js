document.addEventListener('DOMContentLoaded', function () {
    // عناصر النموذج
    const carForm = document.getElementById('carForm');
    const calculateBtn = document.getElementById('calculateBtn');
    const resultsContainer = document.getElementById('resultsContainer');
    const startMessage = document.getElementById('startMessage');
    const engineTypeSelect = document.getElementById('engineType');
    const engineCapacityContainer = document.getElementById('engineCapacityContainer');
    const getOfficialRateBtn = document.getElementById('getOfficialRate');

    // إخفاء/إظهار حقل سعة المحرك بناءً على نوع المحرك
    engineTypeSelect.addEventListener('change', function () {
        if (this.value === 'electric') {
            engineCapacityContainer.classList.add('hidden');
        } else {
            engineCapacityContainer.classList.remove('hidden');
        }
    });

    // الحصول على سعر الصرف الرسمي
    getOfficialRateBtn.addEventListener('click', async function () {
        try {
            const response = await fetch('https://open.er-api.com/v6/latest/USD');
            const data = await response.json();
            if (data.result === 'success') {
                document.getElementById('officialRate').value = data.rates.DZD.toFixed(2);
            } else {
                alert('فشل في الحصول على سعر الصرف الرسمي، يرجى المحاولة لاحقًا');
            }
        } catch (error) {
            console.error('Error fetching exchange rate:', error);
            alert('حدث خطأ أثناء محاولة الحصول على سعر الصرف الرسمي');
        }
    });

    // حساب التكلفة
    calculateBtn.addEventListener('click', function () {
        // التحقق من إدخال جميع البيانات المطلوبة
        const requiredFields = ['carPrice', 'shippingPrice', 'blackMarketRate', 'officialRate', 'carMileage'];
        let missingFields = false;

        for (const field of requiredFields) {
            const input = document.getElementById(field);
            if (!input.value) {
                input.classList.add('border-red-500');
                missingFields = true;
            } else {
                input.classList.remove('border-red-500');
            }
        }

        // التحقق من سعة المحرك إذا كان نوع المحرك ليس كهربائي
        if (engineTypeSelect.value !== 'electric') {
            const engineCapacity = document.getElementById('engineCapacity');
            if (!engineCapacity.value) {
                engineCapacity.classList.add('border-red-500');
                missingFields = true;
            } else {
                engineCapacity.classList.remove('border-red-500');
            }
        }

        if (missingFields) {
            alert('يرجى إدخال جميع البيانات المطلوبة');
            return;
        }

        // جمع البيانات من النموذج
        const data = {
            carPrice: parseFloat(document.getElementById('carPrice').value),
            carPriceCurrency: document.getElementById('carPriceCurrency').value,
            shippingPrice: parseFloat(document.getElementById('shippingPrice').value),
            shippingCurrency: document.getElementById('shippingCurrency').value,
            blackMarketRate: parseFloat(document.getElementById('blackMarketRate').value),
            officialRate: parseFloat(document.getElementById('officialRate').value),
            carType: document.getElementById('carType').value,
            engineType: document.getElementById('engineType').value,
            engineCapacity: engineTypeSelect.value === 'electric' ? 0 : parseFloat(document.getElementById('engineCapacity').value),
            carMileage: parseFloat(document.getElementById('carMileage').value)
        };

        // حساب التكلفة
        const result = calculateCost(data);

        // عرض النتائج
        displayResults(result);

        // إظهار النتائج وإخفاء رسالة البداية
        resultsContainer.classList.remove('hidden');
        startMessage.classList.add('hidden');
    });

    // دالة حساب التكلفة
    function calculateCost(data) {
        // تحويل الأسعار إلى دولار إذا كانت بالدينار
        let carPriceUSD = data.carPrice;
        if (data.carPriceCurrency === 'dzd') {
            carPriceUSD = data.carPrice / data.blackMarketRate;
        }

        let shippingPriceUSD = data.shippingPrice;
        if (data.shippingCurrency === 'dzd') {
            shippingPriceUSD = data.shippingPrice / data.blackMarketRate;
        }

        const totalPriceUSD = carPriceUSD + shippingPriceUSD;

        // تحويل السعر الإجمالي إلى دينار بسعر الصرف الرسمي للجمارك
        const totalPriceDZDOfficial = totalPriceUSD * data.officialRate;

        // تحديد ما إذا كانت السيارة جديدة أم لا
        const isNew = data.carMileage <= 6000;

        // تحديد نسبة الجمارك بناءً على نوع السيارة ونوع المحرك وسعة المحرك
        let customsPercentage = 0;

        if (data.carType === 'tourism') { // سيارة سياحية
            if (data.engineType === 'electric') {
                customsPercentage = isNew ? 57.08 : 11.42;
            } else { // بنزين أو هجين
                if (data.engineCapacity > 1.8) {
                    customsPercentage = isNew ? 151.33 : 121.06;
                } else {
                    customsPercentage = isNew ? 39.23 : 19.62;
                }
            }
        } else { // سيارة نفعية
            if (data.engineType === 'electric') {
                customsPercentage = isNew ? 27.33 : 5.47;
            } else { // بنزين أو هجين
                if (data.engineCapacity > 1.8) {
                    customsPercentage = isNew ? 27.33 : 21.86;
                } else {
                    customsPercentage = isNew ? 27.33 : 13.66;
                }
            }
        }

        // حساب قيمة الجمارك
        const customsValue = totalPriceDZDOfficial * (customsPercentage / 100);

        // حساب القيمة المضافة (TVA)
        const tvaValue = isNew ? 150000 : 0;

        // حساب إجمالي الجمارك
        const totalCustoms = customsValue + tvaValue;

        // حساب سعر السيارة والشحن بالدينار بسعر السوق الموازي
        const carPriceDZD = carPriceUSD * data.blackMarketRate;
        const shippingPriceDZD = shippingPriceUSD * data.blackMarketRate;

        // أعباء أخرى
        const otherFees = 100000;

        // حساب التكلفة الإجمالية
        const totalCost = carPriceDZD + shippingPriceDZD + totalCustoms + otherFees;

        return {
            carPriceUSD,
            shippingPriceUSD,
            totalPriceUSD,
            customsPercentage,
            customsValue,
            tvaValue,
            totalCustoms,
            carPriceDZD,
            shippingPriceDZD,
            otherFees,
            totalCost
        };
    }

    // دالة عرض النتائج
    function displayResults(result) {
        // تنسيق الأرقام
        const formatNumber = (number) => number.toLocaleString('ar-DZ', { maximumFractionDigits: 2 });

        // فاتورة الشراء
        document.getElementById('resultCarPrice').textContent = formatNumber(result.carPriceUSD) + ' دولار';
        document.getElementById('resultShippingPrice').textContent = formatNumber(result.shippingPriceUSD) + ' دولار';
        document.getElementById('resultTotalUSD').textContent = formatNumber(result.totalPriceUSD) + ' دولار';

        // فاتورة الجمركة
        const customsPercentageElement = document.getElementById('resultCustomsPercentage');
        const carMileage = parseFloat(document.getElementById('carMileage').value);
        const isNewCar = carMileage < 6000;
        customsPercentageElement.textContent = `${formatNumber(result.customsPercentage)}%${isNewCar ? ' (جديدة)' : ''}`;
        if (isNewCar) {
            customsPercentageElement.classList.add('text-red-600', 'font-bold');
        } else {
            customsPercentageElement.classList.remove('text-red-600', 'font-bold');
        }
        document.getElementById('resultCustomsValue').textContent = formatNumber(result.customsValue) + ' دينار';
        document.getElementById('resultTVA').textContent = formatNumber(result.tvaValue) + ' دينار';
        document.getElementById('resultTotalCustoms').textContent = formatNumber(result.totalCustoms) + ' دينار';

        // الفاتورة النهائية
        document.getElementById('resultFinalCarPrice').textContent = formatNumber(result.carPriceDZD) + ' دينار';
        document.getElementById('resultFinalShippingPrice').textContent = formatNumber(result.shippingPriceDZD) + ' دينار';
        document.getElementById('resultFinalCustomsValue').textContent = formatNumber(result.customsValue) + ' دينار';
        document.getElementById('resultFinalTVA').textContent = formatNumber(result.tvaValue) + ' دينار';
        document.getElementById('resultOtherFees').textContent = formatNumber(result.otherFees) + ' دينار';
        document.getElementById('resultFinalTotal').textContent = formatNumber(result.totalCost) + ' دينار';
    }
});
