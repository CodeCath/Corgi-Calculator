        // 初始化 Icons
        lucide.createIcons();

        // 取得 DOM 元素
        const dateInput = document.getElementById('birthdate');
        const calcBtn = document.getElementById('calcBtn');
        const dogAgeDisplay = document.getElementById('dogAgeResult');
        const humanAgeDisplay = document.getElementById('humanAgeResult');
        const modal = document.getElementById('customModal');
        const modalMsg = document.getElementById('modalMsg');

        // 定義 LocalStorage 的 Key
        const STORAGE_KEY = 'dog-birth-date';

        // 設置日期選擇器的最大值為今天
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('max', today);

        // [新增功能] 頁面載入時，嘗試從 LocalStorage 讀取資料
        // 相當於範例中的：const saved = localStorage.getItem(KEY);
        const savedDate = localStorage.getItem(STORAGE_KEY);
        if (savedDate) {
            dateInput.value = savedDate;
            // 如果有儲存的資料，直接執行一次計算，讓使用者一進來就看到上次的結果
            // 使用 setTimeout 確保 DOM 完全準備好（雖然放在 body 底下通常沒問題，但這是雙重保險）
            setTimeout(calculateAge, 0);
        }

        // 計算邏輯
        function calculateAge() {
            const birthDateVal = dateInput.value;
            
            if (!birthDateVal) {
                showModal("請先選擇狗狗的出生日期！");
                return;
            }

            const birthDate = new Date(birthDateVal);
            const currentDate = new Date();
            
            if (birthDate > currentDate) {
                showModal("妙麗還沒出生嗎？請選擇過去的日期。");
                return;
            }

            // [新增功能] 當輸入合法且進行計算時，將日期存入 LocalStorage
            // 相當於範例中的：saveBtn click event -> localStorage.setItem(KEY, text);
            localStorage.setItem(STORAGE_KEY, birthDateVal);

            // 1. 計算實際狗年齡 (精確計算用於顯示)
            let years = currentDate.getFullYear() - birthDate.getFullYear();
            let months = currentDate.getMonth() - birthDate.getMonth();
            let days = currentDate.getDate() - birthDate.getDate();

            // 調整月份和日期
            if (days < 0) {
                months--;
                // 獲取上個月的天數
                const prevMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
                days += prevMonthDate.getDate();
            }
            if (months < 0) {
                years--;
                months += 12;
            }

            // 2. 計算用於公式的 Dog Age in Years (浮點數)
            // 為了更精確的公式運算，我們使用總毫秒數
            const diffTime = Math.abs(currentDate - birthDate);
            const diffDays = diffTime / (1000 * 60 * 60 * 24); 
            const dogAgeInYearsFloat = diffDays / 365.25;

            // 3. 套用公式：16 * ln(dog_age) + 31
            // 注意：如果狗年齡極小 (接近0)，ln 會趨向負無窮大。
            // 該公式通常適用於滿月後的狗狗。這裡我們做一個簡單的防呆，如果是負值則顯示 0。
            let humanAge = 0;
            if (dogAgeInYearsFloat > 0) {
                humanAge = 16 * Math.log(dogAgeInYearsFloat) + 31;
            }
            
            // 修正極小年齡可能導致人類年齡為負的情況
            if (humanAge < 0) humanAge = 0;

            // 4. 更新 UI
            
            // 顯示狗年齡：X 歲 Y 個月 (如果 0 歲則只顯示個月，如果 0 個月顯示天)
            let dogAgeString = "";
            if (years > 0) {
                dogAgeString += `${years} <span class="text-2xl">歲</span> `;
            }
            if (months > 0 || years === 0) {
                dogAgeString += `${months} <span class="text-2xl">個月</span>`;
            }
            // 極端情況：剛出生不到一個月
            if (years === 0 && months === 0) {
                 dogAgeString = `${days} <span class="text-2xl">天</span>`;
            }

            dogAgeDisplay.innerHTML = dogAgeString;

            // 顯示人類年齡：取小數點後一位
            humanAgeDisplay.innerHTML = `大約 ${humanAge.toFixed(1)} <span class="text-2xl">歲</span>`;
        }

        // Modal 控制
        function showModal(msg) {
            modalMsg.textContent = msg;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeModal() {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
        
        function showInfo() {
            showModal("此計算機基於加州大學聖地牙哥分校 (UCSD) 的研究團隊於 2020 年發表的表觀遺傳時鐘公式。這比傳統的 'x7' 法則更準確！");
        }

        // 綁定事件
        calcBtn.addEventListener('click', calculateAge);
        
        // 點擊 Modal 背景關閉
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });