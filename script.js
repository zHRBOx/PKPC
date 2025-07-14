document.addEventListener('DOMContentLoaded', async () => {
    // --- STATE MANAGEMENT ---
    let isKinerjaEditMode = false;
    let isPegawaiDataEditMode = false;
    let isCutiEditMode = false;
    let isRekapEditMode = false;

    let allEmployeesMasterList = [];
    let monthlyKinerjaData = {};
    let monthlyCutiData = {};

    let calendarDate = new Date();
    let selectedDates = [];
    let currentEditingPegawaiId = null;

    // --- KONFIGURASI ---
    const LOCAL_STORAGE_EMPLOYEES_KEY = 'pantauanKinerjaEmployees';
    const LOCAL_STORAGE_MONTHLY_KINERJA_KEY = 'pantauanKinerjaMonthlyKinerja';
    const LOCAL_STORAGE_MONTHLY_CUTI_KEY = 'pantauanKinerjaMonthlyCuti';
    
    // --- [UPDATED] DROPBOX CONFIGURATION ---
    // Token Anda sudah dimasukkan langsung di sini.
    const HARDCODED_DROPBOX_TOKEN = "sl.u.AF3Z38vo7BV5T2e2dctRLgFbY_cZnxWk66wOw-SPZWL_YRkMu1LwBCyp6XXG7v2WZ_TtH4lSZOmvZ2NKrQXSNQsq6AGcJVDRSbx8iTcgVtwdxtBH5RR5F_5bsYB3bgSZ_mSDWkklsgZ6uuNvD7mRCnSMwAXjoOdq4zAir3Q_yz30D0pAL1Fv107zNP3zJ1yJTI9P45wkZXX_0A5KHYKC6VDSqmR80WXeetYc_Ag7kfJX3ge8KOcBtbiaORzrTvP_PsNvZkvTK1tZ1gq0qgfSBgdPZkuAam8E5VFbe162RF83dToALD6xBLodEX4JsYumlWXaZBgdW4ejnXWFnxnSsFxUBL0sAt-4vWzFpPTRz85P2JJ9tAhVomaC7nvPHr-A6aTJa8j6SljUkcCQ9m7ss2RJlRqa4rq3iUCktapycl5pYSPnuG81ueTwCV1YD0ZG28TKTaHz5uuPPVEaGkeAiKWgufK5nJKJPvwgdN8hUA907qtrXqImxrbLy0KqwPnT1gsRp5w7qNOwSDd-p7xSZwg_QOcFi-QTtgteWTet03mptQvuInI82mCp6XRs9JsWcyK-j_UB38oqr2kiUJ0AyWBR-0veceQgp4zoCnBc935Ra4hYlKUQq39u6OZAaiIdU65vUj0XRUTh-rVDt__kirkM9YVDsnz5T249gFxwQy8zb1WXg7F7UlKsEwtARVLCo5uhXdvZ-XI4It9rIM30k89slpBOqT7Vg6-As19IFRAz5BSsAbagB50GPLxEurbrW5ngc-5ihBevZqLH_pi76Qxm2JGyx490uIsrJRmxZgdjNmgdmDtS9KcJqbQML5KtkgCM5daKIQUPnYsoB2bOasbOi5xPOn8r3oU69-vtTrtsbCjEJIAz2jZ_dKnxn04gcamabblolCsr3gNqorvAHMTfgq9aLwQT0o6Oac8E6yHQmVgeDnNL705JgAttLSRBchv6rNXVC1Gzs9zZCb8lu2Km435-LH_EUM2HDZ2z5b-iNM5cXR1JsHKGrFXPCutYcrjl-AAtLpoidttDMB1wZekU64KVgeLeoQtLT8O-Vi7PnN-YN1Knk8TaA2ywuC0bkFQYumixWsN9YbFREo1TdaAtW5mq0YLmWM4J-QbzWLNCS_2yqWKPghx8W2ymIvM5owJEe3fuTh0n231rN3Msnj5KraPvd22a8IRpyx9XmH3pTKAsm3vKRZ6ZUjxYD5HXIXv7KMvL1uCWwJVZZTf3VenNaMcgSBsb0WUQNxI7AP566Pz9ZKYcGPpQYaJ00iXlH5b1jVBqNm_bklx9DOhrhVFEd3naPs5nkZ8j-fOT_brTSg";
    const DROPBOX_FOLDER_PATH = '/pkpc';
    const DROPBOX_FILE_PATH = `${DROPBOX_FOLDER_PATH}/data.json`;
    let dbx = null;
    let isDropboxConnected = false;
    let isSyncing = false;

    const manajemenOrder = { 'KUPT': 1, 'WAKIL KUPT': 2, 'PENYELIA INSTRUKTUR': 3, 'PENYELIA DINASAN': 4, 'STAF ADMINISTRASI': 5 };
    const awakJabatan = ['MASINIS MADYA', 'MASINIS MUDA', 'MASINIS PERTAMA', 'CALON MASINIS'];
    const allJabatan = [...Object.keys(manajemenOrder), ...awakJabatan];
    const monthMap = { 'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5, 'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11 };
    
    const statusMap = {
        'H': { text: 'H', class: 'text-black font-bold' },
        'L': { text: 'L', class: 'text-red-500 font-bold' },
        'CT': { text: 'CT', class: 'text-green-500 font-bold' },
        'CP': { text: 'CP', class: 'text-blue-500 font-bold' },
        'CSK': { text: 'CSK', class: 'text-yellow-500 font-bold' },
        'CK': { text: 'CK', class: 'text-green-500 font-bold' },
        'CB': { text: 'CB', class: 'text-green-500 font-bold' },
        'LP': { text: 'LP', class: 'text-red-500 font-bold' },
        'D': { text: 'D', class: 'text-purple-500 font-bold' },
        'S': { text: 'S', class: 'text-orange-500 font-bold' },
        'P': { text: 'P', class: 'text-red-500 font-bold' }
    };
    const leaveTypes = ['CT', 'CP', 'CSK', 'CK', 'CB'];

    // --- ELEMENT SELECTORS (VERSI LENGKAP) ---
    const formTab = document.getElementById('formTab');
    const pantauanTab = document.getElementById('pantauanTab');
    const formContent = document.getElementById('formContent');
    const pantauanContent = document.getElementById('pantauanContent');
    const addPegawaiContainer = document.getElementById('addPegawaiContainer');
    const showPegawaiDataContainer = document.getElementById('showPegawaiDataContainer');
    const addPegawaiBtn = document.getElementById('addPegawaiBtn');
    const mainEditBtn = document.getElementById('mainEditBtn');
    const mainEditTooltip = document.getElementById('mainEditTooltip');
    const showPegawaiDataBtn = document.getElementById('showPegawaiDataBtn');
    const showPegawaiDataTooltip = document.getElementById('showPegawaiDataTooltip');
    const cutiEditBtn = document.getElementById('cutiEditBtn');
    const cutiEditTooltip = document.getElementById('cutiEditTooltip');
    const rekapEditBtn = document.getElementById('rekapEditBtn');
    const rekapEditTooltip = document.getElementById('rekapEditTooltip');
    const formCutiBtn = document.getElementById('formCutiBtn');
    const syncBtn = document.getElementById('syncBtn');
    const syncIcon = document.getElementById('syncIcon');
    const syncTooltip = document.getElementById('syncTooltip');
    const modal = document.getElementById('pegawaiModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const pegawaiForm = document.getElementById('pegawaiForm');
    const jabatanInput = document.getElementById('jabatan');
    const jabatanSuggestions = document.getElementById('jabatanSuggestions');
    const pegawaiModalTitle = document.getElementById('pegawaiModalTitle');
    const pegawaiModalSubmitBtn = document.getElementById('pegawaiModalSubmitBtn');
    const cutiFormModal = document.getElementById('cutiFormModal');
    const closeCutiModalBtn = document.getElementById('closeCutiModalBtn');
    const cutiForm = document.getElementById('cutiForm');
    const cutiNippInput = document.getElementById('cutiNipp');
    const nippError = document.getElementById('nippError');
    const cutiDetailsWrapper = document.getElementById('cutiDetailsWrapper');
    const cutiNamaInput = document.getElementById('cutiNama');
    const cutiJabatanInput = document.getElementById('cutiJabatan');
    const cutiJenisSelect = document.getElementById('cutiJenis');
    const cutiTanggalWrapper = document.getElementById('cutiTanggalWrapper');
    const cutiSubmitWrapper = document.getElementById('cutiSubmitWrapper');
    const openCalendarBtn = document.getElementById('openCalendarBtn');
    const cutiTanggalDisplay = document.getElementById('cutiTanggalDisplay');
    const calendarModal = document.getElementById('calendarModal');
    const closeCalendarBtn = document.getElementById('closeCalendarBtn');
    const selectDatesBtn = document.getElementById('selectDatesBtn');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const monthYearHeader = document.getElementById('monthYearHeader');
    const calendarGrid = document.getElementById('calendarGrid');
    const manajemenTbody = document.getElementById('manajemenTbody');
    const masinisTbody = document.getElementById('masinisTbody');
    const manajemenThead = document.getElementById('manajemenThead');
    const masinisThead = document.getElementById('masinisThead');
    const cutiTbody = document.getElementById('cutiTbody');
    const cutiManajemenTbody = document.getElementById('cutiManajemenTbody');
    const cutiAwakTbody = document.getElementById('cutiAwakTbody');
    const kinerjaBulan = document.getElementById('kinerjaBulan');
    const kinerjaTahunInput = document.getElementById('kinerjaTahun');
    const kinerjaSuggestions = document.getElementById('tahunSuggestions');
    const cutiBulan = document.getElementById('cutiBulan');
    const cutiTahunInput = document.getElementById('cutiTahun');
    const cutiSuggestions = document.getElementById('cutiTahunSuggestions');
    const rekapBulan = document.getElementById('rekapBulan');
    const rekapTahunInput = document.getElementById('rekapTahun');
    const rekapSuggestions = document.getElementById('rekapTahunSuggestions');
    const notificationModal = document.getElementById('notificationModal');
    const notificationMessage = document.getElementById('notificationMessage');
    const closeNotificationModalBtn = document.getElementById('closeNotificationModalBtn');

    // --- DROPBOX FUNCTIONS ---

    const updateSyncIconState = (isConnected) => {
        isDropboxConnected = isConnected;
        if (isConnected) {
            syncIcon.classList.remove('text-red-500');
            syncIcon.classList.add('text-green-500');
            syncTooltip.textContent = 'Terhubung ke Dropbox';
        } else {
            syncIcon.classList.remove('text-green-500');
            syncIcon.classList.add('text-red-500');
            syncTooltip.textContent = 'Gagal terhubung. Periksa token.';
        }
    };

    const saveToDropbox = async () => {
        if (!isDropboxConnected || isSyncing) return;
        isSyncing = true;
        syncIcon.classList.add('animate-spin');

        const dataToSave = {
            allEmployeesMasterList,
            monthlyKinerjaData,
            monthlyCutiData,
            lastModified: new Date().toISOString()
        };

        try {
            try {
                await dbx.filesGetMetadata({ path: DROPBOX_FOLDER_PATH });
            } catch (error) {
                if (error.status === 409) {
                    await dbx.filesCreateFolderV2({ path: DROPBOX_FOLDER_PATH });
                } else { throw error; }
            }
            
            await dbx.filesUpload({
                path: DROPBOX_FILE_PATH,
                contents: JSON.stringify(dataToSave, null, 2),
                mode: 'overwrite'
            });
            console.log('Data berhasil disimpan ke Dropbox.');
        } catch (error) {
            console.error('Gagal menyimpan ke Dropbox:', error);
            showNotification('Gagal menyimpan ke Dropbox. Data tetap aman di browser.');
        } finally {
            syncIcon.classList.remove('animate-spin');
            isSyncing = false;
        }
    };

    const loadFromDropbox = async () => {
        if (!isDropboxConnected || isSyncing) return;
        isSyncing = true;
        syncIcon.classList.add('animate-spin');

        try {
            const { result } = await dbx.filesDownload({ path: DROPBOX_FILE_PATH });
            const fileContent = await result.fileBlob.text();
            const data = JSON.parse(fileContent);

            allEmployeesMasterList = data.allEmployeesMasterList || [];
            monthlyKinerjaData = data.monthlyKinerjaData || {};
            monthlyCutiData = data.monthlyCutiData || {};
            
            console.log('Data berhasil dimuat dari Dropbox.');
            saveDataToLocalStorage();
        } catch (error) {
            console.warn('Gagal memuat dari Dropbox. Memuat dari local storage.', error);
            loadDataFromLocalStorage();
        } finally {
            syncIcon.classList.remove('animate-spin');
            isSyncing = false;
        }
    };

    const initDropbox = async () => {
        // [UPDATED] Menggunakan token yang sudah ada di kode, bukan dari localStorage
        if (!HARDCODED_DROPBOX_TOKEN) {
            console.error("Token Dropbox tidak ditemukan di dalam kode.");
            updateSyncIconState(false);
            loadDataFromLocalStorage();
            return;
        }

        dbx = new Dropbox.Dropbox({ accessToken: HARDCODED_DROPBOX_TOKEN });
        try {
            await dbx.usersGetCurrentAccount();
            updateSyncIconState(true);
            await loadFromDropbox();
        } catch (error) {
            console.error('Token Dropbox tidak valid:', error);
            dbx = null;
            updateSyncIconState(false);
            loadDataFromLocalStorage();
        }
    };

    // --- DATA MANAGEMENT FUNCTIONS ---

    const saveDataToLocalStorage = () => {
        localStorage.setItem(LOCAL_STORAGE_EMPLOYEES_KEY, JSON.stringify(allEmployeesMasterList));
        localStorage.setItem(LOCAL_STORAGE_MONTHLY_KINERJA_KEY, JSON.stringify(monthlyKinerjaData));
        localStorage.setItem(LOCAL_STORAGE_MONTHLY_CUTI_KEY, JSON.stringify(monthlyCutiData));
    };
    
    const loadDataFromLocalStorage = () => {
        try {
            const storedEmployees = localStorage.getItem(LOCAL_STORAGE_EMPLOYEES_KEY);
            allEmployeesMasterList = storedEmployees ? JSON.parse(storedEmployees) : [];
            const storedKinerja = localStorage.getItem(LOCAL_STORAGE_MONTHLY_KINERJA_KEY);
            monthlyKinerjaData = storedKinerja ? JSON.parse(storedKinerja) : {};
            const storedCuti = localStorage.getItem(LOCAL_STORAGE_MONTHLY_CUTI_KEY);
            monthlyCutiData = storedCuti ? JSON.parse(storedCuti) : {};
        } catch (e) {
            console.error('Gagal memuat data dari local storage:', e);
            allEmployeesMasterList = []; monthlyKinerjaData = {}; monthlyCutiData = {};
        }
    };

    const saveData = () => {
        saveDataToLocalStorage();
        if (isDropboxConnected) {
            saveToDropbox();
        }
    };

    // --- EVENT LISTENERS ---
    
    // [UPDATED] Logika tombol sinkronisasi disederhanakan.
    syncBtn.addEventListener('click', async () => {
        if (isDropboxConnected) {
            showNotification('Memulai sinkronisasi dengan Dropbox...');
            await loadFromDropbox();
            refreshAllViews();
            await saveToDropbox(); 
        } else {
            showNotification('Gagal terhubung ke Dropbox. Periksa token di dalam kode.');
        }
    });
    
    // --- CORE APP LOGIC ---
    const years = [];
    const currentYearForList = new Date().getFullYear();
    for (let i = currentYearForList + 5; i >= currentYearForList - 5; i--) {
        years.push(i);
    }

    const getMonthKey = (year, monthIndex) => `${year}-${String(monthIndex).padStart(2, '0')}`;

    const getPegawaiForMonth = (year, monthIndex) => {
        const currentMonthKey = getMonthKey(year, monthIndex);
        const employeesForMonth = allEmployeesMasterList.filter(emp => {
            if (!emp.startDate) return true;
            const [startYear, startMonth] = emp.startDate.split('-').map(Number);
            return (startYear < year) || (startYear === year && startMonth <= monthIndex);
        }).map(emp => JSON.parse(JSON.stringify(emp)));
        const monthKinerja = monthlyKinerjaData[currentMonthKey] || {};
        employeesForMonth.forEach(emp => {
            emp.kinerja = monthKinerja[emp.id] ? { ...monthKinerja[emp.id] } : {};
        });
        const manajemen = employeesForMonth.filter(emp => manajemenOrder.hasOwnProperty(emp.jabatan.toUpperCase()));
        const awak = employeesForMonth.filter(emp => awakJabatan.includes(emp.jabatan.toUpperCase()));
        return { manajemen, awak, cuti: monthlyCutiData[currentMonthKey] || [] };
    };

    const invalidateFutureMonths = (year, monthIndex) => {
        for (const key in monthlyKinerjaData) {
            const [keyYear, keyMonth] = key.split('-').map(Number);
            if (keyYear > year || (keyYear === year && keyMonth > monthIndex)) delete monthlyKinerjaData[key];
        }
        for (const key in monthlyCutiData) {
            const [keyYear, keyMonth] = key.split('-').map(Number);
            if (keyYear > year || (keyYear === year && keyMonth > monthIndex)) delete monthlyCutiData[key];
        }
        saveData();
    };

    const formatDateToDisplay = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const parseDisplayDate = (displayDate) => {
        const parts = displayDate.split(' ');
        if (parts.length !== 3) return null;
        const day = parseInt(parts[0], 10);
        const monthName = parts[1];
        const month = Object.keys(monthMap).findIndex(m => m.toLowerCase() === monthName.toLowerCase());
        const year = parseInt(parts[2], 10);
        if (isNaN(day) || month === -1 || isNaN(year)) return null;
        return new Date(year, month, day);
    };
    
    function showNotification(message) {
        if (notificationMessage && notificationModal) {
            notificationMessage.textContent = message;
            notificationModal.classList.remove('hidden');
        }
    }

    const setupCoreEventListeners = () => {
        if (closeNotificationModalBtn) {
            closeNotificationModalBtn.addEventListener('click', () => {
                if (notificationModal) {
                    notificationModal.classList.add('hidden');
                }
            });
        }
    };

    const generateCalendar = () => {
        calendarGrid.innerHTML = '';
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();
        monthYearHeader.textContent = `${calendarDate.toLocaleString('id-ID', { month: 'long' })} ${year}`;

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarGrid.appendChild(document.createElement('div'));
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dateCell = document.createElement('div');
            dateCell.className = 'p-2 text-center cursor-pointer hover:bg-gray-700 rounded-full';
            dateCell.textContent = i;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            dateCell.dataset.date = dateStr;

            if (selectedDates.includes(dateStr)) {
                dateCell.classList.add('date-selected');
            }

            dateCell.addEventListener('click', () => {
                dateCell.classList.toggle('date-selected');
                if (selectedDates.includes(dateStr)) {
                    selectedDates = selectedDates.filter(d => d !== dateStr);
                } else {
                    selectedDates.push(dateStr);
                }
            });
            calendarGrid.appendChild(dateCell);
        }
    };

    openCalendarBtn.addEventListener('click', () => {
        calendarModal.classList.remove('hidden');
        generateCalendar();
    });

    closeCalendarBtn.addEventListener('click', () => calendarModal.classList.add('hidden'));
    prevMonthBtn.addEventListener('click', () => {
        calendarDate.setMonth(calendarDate.getMonth() - 1);
        generateCalendar();
    });
    nextMonthBtn.addEventListener('click', () => {
        calendarDate.setMonth(calendarDate.getMonth() + 1);
        generateCalendar();
    });
    selectDatesBtn.addEventListener('click', () => {
        selectedDates.sort();
        cutiTanggalDisplay.value = selectedDates.map(formatDateToDisplay).join(', ');
        calendarModal.classList.add('hidden');

        if (selectedDates.length > 0) {
            cutiSubmitWrapper.classList.remove('hidden');
        } else {
            cutiSubmitWrapper.classList.add('hidden');
        }
    });

    const updateCalendarHeader = (year, monthIndex) => {
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        const dayNames = ['M', 'S', 'S', 'R', 'K', 'J', 'S'];

        let headerHTML = `<tr>
                <th class="p-3 w-12 text-center font-semibold sticky-col">NO</th>
                <th class="p-3 w-48 font-semibold">NAMA</th>
                <th class="p-3 w-24 text-center font-semibold">NIPP</th>
                <th class="p-3 w-48 text-center font-semibold">JABATAN</th>`;

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, monthIndex, day);
            const dayOfWeek = date.getDay();
            const dayName = dayNames[dayOfWeek];
            const isSunday = dayOfWeek === 0;
            const thClass = isSunday
                ? 'p-3 text-center w-10 font-semibold bg-red-800 text-red-200'
                : 'p-3 text-center w-10 font-semibold';
            headerHTML += `<th class="${thClass}">${dayName}<br>${day}</th>`;
        }

        headerHTML += `<th class="p-3 w-16 text-center font-semibold delete-col ${!isPegawaiDataEditMode ? 'hidden' : ''}">AKSI</th></tr>`;
        manajemenThead.innerHTML = headerHTML;
        masinisThead.innerHTML = headerHTML;
    };

    const renderCutiTable = (dataCutiForSelectedMonth) => {
        cutiTbody.innerHTML = '';
        if (!dataCutiForSelectedMonth) return;

        dataCutiForSelectedMonth.sort((a, b) => {
            const dateA = parseDisplayDate(a.tanggal);
            const dateB = parseDisplayDate(b.tanggal);
            if (!dateA || !dateB) return 0;
            return dateA - dateB;
        });

        dataCutiForSelectedMonth.forEach(cuti => {
            const row = document.createElement('tr');
            row.dataset.id = cuti.id;
            row.innerHTML = `
                <td class="p-3 text-center">${cuti.tanggal}</td>
                <td class="p-3">${cuti.nama}</td>
                <td class="p-3 text-center">${cuti.nipp}</td>
                <td class="p-3 text-center">${cuti.jenis}</td>
                <td class="p-3 text-center cuti-delete-col ${!isCutiEditMode ? 'hidden' : ''}">
                    <button class="text-red-500 hover:text-red-700 cuti-delete-btn">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </td>
            `;
            cutiTbody.appendChild(row);
        });
    };

    const renderCutiTahunanTables = (manajemen, awak) => {
        const render = (data, tbody, isEditModeForRekap) => {
            tbody.innerHTML = '';
            if (!data) return;
            data.forEach((pegawai, index) => {
                let diambilCount = 0;
                const currentYear = parseInt(rekapTahunInput.value, 10);

                for (let m = 0; m < 12; m++) {
                    const monthKey = getMonthKey(currentYear, m);
                    const monthCutiEntries = monthlyCutiData[monthKey] || [];
                    monthCutiEntries.forEach(cutiEntry => {
                        if (cutiEntry.nipp === pegawai.nipp && cutiEntry.jenis === 'CT') {
                            diambilCount++;
                        }
                    });
                }

                const row = document.createElement('tr');
                row.dataset.id = pegawai.id;
                row.innerHTML = `
                    <td class="p-3 text-center">${index + 1}</td>
                    <td class="p-3">${pegawai.nama}</td>
                    <td class="p-3 text-center">${pegawai.nipp}</td>
                    <td class="p-3 text-center">${pegawai.jabatan}</td>
                    <td class="p-3 rekap-editable text-center" data-field="totalCutiTahunan" contenteditable="${isEditModeForRekap}">${pegawai.totalCutiTahunan || 0}</td>
                    <td class="p-3 text-center">${diambilCount}</td>
                `;
                tbody.appendChild(row);
            });
        };
        render(manajemen, cutiManajemenTbody, isRekapEditMode);
        render(awak, cutiAwakTbody, isRekapEditMode);
    };

    const handleKinerjaDateChange = () => {
        const year = parseInt(kinerjaTahunInput.value, 10);
        const monthIndex = parseInt(kinerjaBulan.value, 10);
        if (!isNaN(year) && year.toString().length === 4 && !isNaN(monthIndex)) {
            updateCalendarHeader(year, monthIndex);
            const dataForMonth = getPegawaiForMonth(year, monthIndex);
            sortAndRenderAll(dataForMonth);
        }
    };

    const handleCutiDateChange = () => {
        const year = parseInt(cutiTahunInput.value, 10);
        const monthIndex = parseInt(cutiBulan.value, 10);
        if (!isNaN(year) && year.toString().length === 4 && !isNaN(monthIndex)) {
            renderCutiTable(monthlyCutiData[getMonthKey(year, monthIndex)] || []);
        }
    };

    const handleRekapDateChange = () => {
        const year = parseInt(rekapTahunInput.value, 10);
        const monthIndex = parseInt(rekapBulan.value, 10);
        if (!isNaN(year) && year.toString().length === 4 && !isNaN(monthIndex)) {
            const dataForMonth = getPegawaiForMonth(year, monthIndex);
            renderCutiTahunanTables(dataForMonth.manajemen, dataForMonth.awak);
        }
    };

    const setupJabatanSuggestions = (inputElement, suggestionsElement, jabatanData) => {
        const showSuggestions = (filteredJabatan) => {
            suggestionsElement.innerHTML = '';
            if (filteredJabatan.length === 0) {
                suggestionsElement.classList.add('hidden');
                return;
            }
            filteredJabatan.forEach(jabatan => {
                const item = document.createElement('div');
                item.textContent = jabatan;
                item.className = 'px-3 py-2 cursor-pointer hover:bg-gray-600';
                item.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    inputElement.value = jabatan;
                    suggestionsElement.classList.add('hidden');
                });
                suggestionsElement.appendChild(item);
            });
            suggestionsElement.classList.remove('hidden');
        };

        inputElement.addEventListener('input', () => {
            const currentValue = inputElement.value.trim();
            if (currentValue.length > 0) {
                const filtered = jabatanData.filter(j => j.toUpperCase().includes(currentValue.toUpperCase()));
                showSuggestions(filtered);
            } else {
                suggestionsElement.classList.add('hidden');
            }
        });

        document.addEventListener('click', (e) => {
            if (!inputElement.parentElement.contains(e.target)) {
                suggestionsElement.classList.add('hidden');
            }
        });
    };

    const setupYearSuggestions = (inputElement, suggestionsElement, yearsData, callback) => {
        const showSuggestions = (filteredYears) => {
            suggestionsElement.innerHTML = '';
            if (filteredYears.length === 0) {
                suggestionsElement.classList.add('hidden');
                return;
            }
            filteredYears.forEach(year => {
                const item = document.createElement('div');
                item.textContent = year;
                item.className = 'px-3 py-2 cursor-pointer hover:bg-gray-600';
                item.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    inputElement.value = year;
                    suggestionsElement.classList.add('hidden');
                    callback();
                });
                suggestionsElement.appendChild(item);
            });
            suggestionsElement.style.width = 'max-content';
            suggestionsElement.style.minWidth = `${inputElement.offsetWidth}px`;
            suggestionsElement.classList.remove('hidden');
        };
        inputElement.addEventListener('focus', () => {
            const currentValue = inputElement.value;
            const filtered = yearsData.filter(y => y.toString().startsWith(currentValue));
            showSuggestions(filtered.length > 0 ? filtered : yearsData);
        });
        inputElement.addEventListener('input', () => {
            const currentValue = inputElement.value;
            const filtered = yearsData.filter(y => y.toString().startsWith(currentValue));
            showSuggestions(filtered);
        });
        document.addEventListener('click', (e) => {
            if (!inputElement.parentElement.contains(e.target)) {
                suggestionsElement.classList.add('hidden');
            }
        });
    };

    kinerjaBulan.addEventListener('change', handleKinerjaDateChange);
    kinerjaTahunInput.addEventListener('change', handleKinerjaDateChange);
    cutiBulan.addEventListener('change', handleCutiDateChange);
    cutiTahunInput.addEventListener('change', handleCutiDateChange);
    rekapBulan.addEventListener('change', handleRekapDateChange);
    rekapTahunInput.addEventListener('change', handleRekapDateChange);

    formTab.addEventListener('click', (e) => {
        e.preventDefault();
        formTab.classList.add('tab-active');
        pantauanTab.classList.remove('tab-active');
        pantauanTab.classList.remove('bg-gray-700', 'font-semibold', 'text-gray-50');
        pantauanTab.classList.add('text-gray-300', 'font-medium', 'hover:bg-gray-700');
        formContent.classList.remove('hidden');
        pantauanContent.classList.add('hidden');
    });
    pantauanTab.addEventListener('click', (e) => {
        e.preventDefault();
        pantauanTab.classList.add('tab-active');
        formTab.classList.remove('tab-active');
        formTab.classList.remove('bg-gray-700', 'font-semibold', 'text-gray-50');
        formTab.classList.add('text-gray-300', 'font-medium', 'hover:bg-gray-700');
        pantauanContent.classList.remove('hidden');
        formContent.classList.add('hidden');
    });

    const enterCutiEditMode = () => {
        isCutiEditMode = true;
        cutiEditBtn.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
        cutiEditBtn.classList.add('bg-green-600', 'hover:bg-green-700');
        cutiEditTooltip.textContent = 'Simpan';
        document.querySelectorAll('.cuti-delete-col').forEach(col => col.classList.remove('hidden'));
    };

    const exitCutiEditMode = () => {
        isCutiEditMode = false;
        cutiEditBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
        cutiEditBtn.classList.add('bg-yellow-500', 'hover:bg-yellow-600');
        cutiEditTooltip.textContent = 'Edit Data Cuti';
        document.querySelectorAll('.cuti-delete-col').forEach(col => col.classList.add('hidden'));
        saveData();
    };

    const enterRekapEditMode = () => {
        isRekapEditMode = true;
        rekapEditBtn.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
        rekapEditBtn.classList.add('bg-green-600', 'hover:bg-green-700');
        rekapEditTooltip.textContent = 'Simpan';
        document.querySelectorAll('.rekap-editable[data-field="totalCutiTahunan"]').forEach(cell => cell.setAttribute('contenteditable', 'true'));
    };

    const exitRekapEditMode = () => {
        isRekapEditMode = false;
        rekapEditBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
        rekapEditBtn.classList.add('bg-yellow-500', 'hover:bg-yellow-600');
        rekapEditTooltip.textContent = 'Edit Data Rekap Cuti';
        document.querySelectorAll('.rekap-editable[data-field="totalCutiTahunan"]').forEach(cell => cell.setAttribute('contenteditable', 'false'));

        const year = parseInt(rekapTahunInput.value, 10);
        const monthIndex = parseInt(rekapBulan.value, 10);

        document.querySelectorAll('#cutiManajemenTbody tr, #cutiAwakTbody tr').forEach(row => {
            const id = parseInt(row.dataset.id, 10);
            const pegawai = allEmployeesMasterList.find(p => p.id === id);
            if (pegawai) {
                pegawai.totalCutiTahunan = parseInt(row.querySelector('[data-field="totalCutiTahunan"]').textContent, 10) || 0;
            }
        });

        invalidateFutureMonths(year, monthIndex);
        handleRekapDateChange();
        saveData();
    };

    cutiEditBtn.addEventListener('click', () => {
        if (isCutiEditMode) {
            exitCutiEditMode();
        } else {
            enterCutiEditMode();
        }
    });

    rekapEditBtn.addEventListener('click', () => {
        if (isRekapEditMode) {
            exitRekapEditMode();
        } else {
            enterRekapEditMode();
        }
    });

    cutiTbody.addEventListener('click', (e) => {
        const deleteButton = e.target.closest('.cuti-delete-btn');
        if (deleteButton && isCutiEditMode) {
            const row = deleteButton.closest('tr');
            const cutiId = parseFloat(row.dataset.id);
            const year = parseInt(cutiTahunInput.value, 10);
            const monthIndex = parseInt(cutiBulan.value, 10);
            const key = getMonthKey(year, monthIndex);

            const cutiEntryToDelete = monthlyCutiData[key]?.find(c => c.id === cutiId);

            if (monthlyCutiData[key]) {
                monthlyCutiData[key] = monthlyCutiData[key].filter(c => c.id !== cutiId);
            }

            if (cutiEntryToDelete) {
                const dateParts = cutiEntryToDelete.tanggal.split(' ');
                const day = parseInt(dateParts[0], 10);
                const employeeId = cutiEntryToDelete.idPegawai;

                if (monthlyKinerjaData[key] && monthlyKinerjaData[key][employeeId]) {
                    delete monthlyKinerjaData[key][employeeId][day];
                    if (Object.keys(monthlyKinerjaData[key][employeeId]).length === 0) {
                        delete monthlyKinerjaData[key][employeeId];
                    }
                    if (Object.keys(monthlyKinerjaData[key]).length === 0) {
                        delete monthlyKinerjaData[key];
                    }
                }
            }

            invalidateFutureMonths(year, monthIndex);
            handleCutiDateChange();
            handleRekapDateChange();
            handleKinerjaDateChange();
            saveData();
        }
    });

    const openPegawaiModal = (pegawai = null) => {
        pegawaiForm.reset();
        jabatanSuggestions.classList.add('hidden');
        currentEditingPegawaiId = null;

        if (pegawai) {
            pegawaiModalTitle.textContent = 'Edit Data Pegawai';
            pegawaiModalSubmitBtn.textContent = 'Simpan Perubahan';
            document.getElementById('nama').value = pegawai.nama;
            document.getElementById('nipp').value = pegawai.nipp;
            document.getElementById('jabatan').value = pegawai.jabatan;
            document.getElementById('totalCutiTahunan').value = pegawai.totalCutiTahunan;
            currentEditingPegawaiId = pegawai.id;
        } else {
            pegawaiModalTitle.textContent = 'Tambah Pegawai Baru';
            pegawaiModalSubmitBtn.textContent = 'Tambah Pegawai';
        }
        modal.classList.remove('hidden');
    };

    const closePegawaiModal = () => {
        modal.classList.add('hidden');
        pegawaiForm.reset();
        jabatanSuggestions.classList.add('hidden');
        currentEditingPegawaiId = null;
    };

    addPegawaiBtn.addEventListener('click', () => openPegawaiModal());
    closeModalBtn.addEventListener('click', closePegawaiModal);

    pegawaiForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nama = document.getElementById('nama').value.toUpperCase();
        const nipp = document.getElementById('nipp').value;
        const jabatan = document.getElementById('jabatan').value.toUpperCase();
        const totalCutiTahunan = parseInt(document.getElementById('totalCutiTahunan').value, 10) || 0;

        const isDuplicateNipp = allEmployeesMasterList.some(pegawai => {
            return pegawai.nipp === nipp && pegawai.id !== currentEditingPegawaiId;
        });

        if (isDuplicateNipp) {
            showNotification('NIPP sudah terdaftar. Silakan gunakan NIPP lain.');
            return;
        }

        if (currentEditingPegawaiId) {
            const pegawaiToUpdate = allEmployeesMasterList.find(p => p.id === currentEditingPegawaiId);
            if (pegawaiToUpdate) {
                pegawaiToUpdate.nama = nama;
                pegawaiToUpdate.nipp = nipp;
                pegawaiToUpdate.jabatan = jabatan;
                pegawaiToUpdate.totalCutiTahunan = totalCutiTahunan;
            }
        } else {
            const newPegawai = {
                id: Date.now(),
                nama: nama,
                nipp: nipp,
                jabatan: jabatan,
                totalCutiTahunan: totalCutiTahunan,
                startDate: getMonthKey(parseInt(kinerjaTahunInput.value, 10), parseInt(kinerjaBulan.value, 10))
            };
            allEmployeesMasterList.push(newPegawai);
        }

        saveData();
        handleKinerjaDateChange();
        handleCutiDateChange();
        handleRekapDateChange();
        closePegawaiModal();
    });

    const resetCutiForm = () => {
        cutiForm.reset();
        cutiDetailsWrapper.classList.add('hidden');
        cutiTanggalWrapper.classList.add('hidden');
        cutiSubmitWrapper.classList.add('hidden');
        nippError.classList.add('hidden');
        selectedDates = [];
    };

    const openCutiFormModal = () => {
        resetCutiForm();
        cutiFormModal.classList.remove('hidden');
    };

    const closeCutiFormModal = () => {
        cutiFormModal.classList.add('hidden');
        resetCutiForm();
    };

    formCutiBtn.addEventListener('click', openCutiFormModal);
    closeCutiModalBtn.addEventListener('click', closeCutiFormModal);

    cutiNippInput.addEventListener('input', () => {
        const nippValue = cutiNippInput.value.trim();
        const pegawai = allEmployeesMasterList.find(p => p.nipp === nippValue);

        if (pegawai) {
            nippError.classList.add('hidden');
            cutiNamaInput.value = pegawai.nama;
            cutiJabatanInput.value = pegawai.jabatan;
            cutiDetailsWrapper.classList.remove('hidden');
        } else {
            nippError.classList.remove('hidden');
            cutiDetailsWrapper.classList.add('hidden');
            cutiTanggalWrapper.classList.add('hidden');
            cutiSubmitWrapper.classList.add('hidden');
            cutiJenisSelect.value = '';
            cutiTanggalDisplay.value = '';
            selectedDates = [];
        }
    });

    cutiJenisSelect.addEventListener('change', () => {
        if (cutiJenisSelect.value) {
            cutiTanggalWrapper.classList.remove('hidden');
        } else {
            cutiTanggalWrapper.classList.add('hidden');
            cutiSubmitWrapper.classList.add('hidden');
        }
    });

    cutiForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (selectedDates.length === 0) return;

        const nipp = cutiNippInput.value;
        const jenis = cutiJenisSelect.value;
        const nama = cutiNamaInput.value;
        const jabatan = cutiJabatanInput.value;

        const employeeInMasterList = allEmployeesMasterList.find(p => p.nipp === nipp);

        if (jenis === 'CT') {
            let currentYearCTCount = 0;
            const currentYear = new Date().getFullYear();
            for (let m = 0; m < 12; m++) {
                const monthKey = getMonthKey(currentYear, m);
                const monthCutiEntries = monthlyCutiData[monthKey] || [];
                monthCutiEntries.forEach(cutiEntry => {
                    if (cutiEntry.nipp === nipp && cutiEntry.jenis === 'CT') {
                        currentYearCTCount++;
                    }
                });
            }

            if (employeeInMasterList.totalCutiTahunan - currentYearCTCount < selectedDates.length) {
                showNotification('Sisa cuti tahunan tidak mencukupi untuk jumlah hari yang dipilih.');
                return;
            }

            const isManajemen = manajemenOrder.hasOwnProperty(jabatan.toUpperCase());
            const quota = isManajemen ? 2 : 3;

            for (const dateStr of selectedDates) {
                const date = new Date(dateStr + 'T00:00:00');
                const kinerjaMonthKey = getMonthKey(date.getFullYear(), date.getMonth());
                let countCTOnThisDay = 0;
                allEmployeesMasterList.forEach(p => {
                    const empKinerjaForMonth = monthlyKinerjaData[kinerjaMonthKey] && monthlyKinerjaData[kinerjaMonthKey][p.id] ? monthlyKinerjaData[kinerjaMonthKey][p.id] : {};
                    if (empKinerjaForMonth[date.getDate()] === 'CT') {
                        countCTOnThisDay++;
                    }
                });

                if (countCTOnThisDay >= quota) {
                    showNotification(`Kuota cuti tahunan pada tanggal ${formatDateToDisplay(dateStr)} untuk kategori ${isManajemen ? 'Manajemen' : 'Awak'} sudah penuh.`);
                    return;
                }
            }
        }

        selectedDates.forEach(dateStr => {
            const date = new Date(dateStr + 'T00:00:00');
            const year = date.getFullYear();
            const month = date.getMonth();
            const day = date.getDate();
            const monthKey = getMonthKey(year, month);

            if (!monthlyCutiData[monthKey]) {
                monthlyCutiData[monthKey] = [];
            }

            const newCutiEntry = {
                id: Date.now() + Math.random(),
                tanggal: formatDateToDisplay(dateStr),
                nama: nama,
                nipp: nipp,
                jenis: jenis,
                jabatan: jabatan,
                idPegawai: employeeInMasterList.id
            };
            monthlyCutiData[monthKey].push(newCutiEntry);

            if (!monthlyKinerjaData[monthKey]) {
                monthlyKinerjaData[monthKey] = {};
            }
            if (!monthlyKinerjaData[monthKey][employeeInMasterList.id]) {
                monthlyKinerjaData[monthKey][employeeInMasterList.id] = {};
            }
            monthlyKinerjaData[monthKey][employeeInMasterList.id][day] = jenis;
        });

        const lastLeaveDate = new Date(selectedDates[selectedDates.length - 1] + 'T00:00:00');
        invalidateFutureMonths(lastLeaveDate.getFullYear(), lastLeaveDate.getMonth());

        handleCutiDateChange();
        handleRekapDateChange();
        handleKinerjaDateChange();
        closeCutiFormModal();
        saveData();
    });

    const enterKinerjaEditMode = () => {
        isKinerjaEditMode = true;
        isPegawaiDataEditMode = false;
        showPegawaiDataBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
        showPegawaiDataBtn.classList.add('bg-blue-500', 'hover:bg-blue-600');
        showPegawaiDataTooltip.textContent = 'Lihat Data Pegawai';

        mainEditBtn.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
        mainEditBtn.classList.add('bg-green-600', 'hover:bg-green-700');
        mainEditTooltip.textContent = 'Simpan Perubahan Kinerja';
        addPegawaiContainer.classList.remove('hidden');
        showPegawaiDataContainer.classList.remove('hidden');
        showPegawaiDataBtn.disabled = false;
        showPegawaiDataBtn.classList.remove('opacity-50', 'cursor-not-allowed');

        document.querySelectorAll('.editable').forEach(cell => cell.setAttribute('contenteditable', 'false'));
        document.querySelectorAll('.delete-col').forEach(col => col.classList.add('hidden'));

        document.querySelectorAll('.calendar-cell').forEach(cell => cell.setAttribute('tabindex', '0'));

        handleKinerjaDateChange();
    };

    const exitKinerjaEditMode = () => {
        isKinerjaEditMode = false;
        mainEditBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
        mainEditBtn.classList.add('bg-yellow-500', 'hover:bg-yellow-600');
        mainEditTooltip.textContent = 'Edit Kinerja';
        addPegawaiContainer.classList.add('hidden');
        showPegawaiDataContainer.classList.add('hidden');
        showPegawaiDataBtn.disabled = true;
        showPegawaiDataBtn.classList.add('opacity-50', 'cursor-not-allowed');

        document.querySelectorAll('.calendar-cell').forEach(cell => cell.removeAttribute('tabindex'));

        handleKinerjaDateChange();
        saveData();
    };

    const enterPegawaiDataEditMode = () => {
        isPegawaiDataEditMode = true;
        isKinerjaEditMode = false;
        mainEditBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
        mainEditBtn.classList.add('bg-yellow-500', 'hover:bg-yellow-600');
        mainEditTooltip.textContent = 'Edit Kinerja';

        showPegawaiDataBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
        showPegawaiDataBtn.classList.add('bg-green-600', 'hover:bg-green-700');
        showPegawaiDataTooltip.textContent = 'Simpan Data Pegawai';
        mainEditBtn.disabled = true;
        mainEditBtn.classList.add('opacity-50', 'cursor-not-allowed');

        document.querySelectorAll('.editable').forEach(cell => cell.setAttribute('contenteditable', 'true'));
        document.querySelectorAll('.delete-col').forEach(col => col.classList.remove('hidden'));

        document.querySelectorAll('.calendar-cell').forEach(cell => cell.removeAttribute('tabindex'));

        handleKinerjaDateChange();
    };

    const exitPegawaiDataEditMode = () => {
        isPegawaiDataEditMode = false;
        showPegawaiDataBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
        showPegawaiDataBtn.classList.add('bg-blue-500', 'hover:bg-blue-600');
        showPegawaiDataTooltip.textContent = 'Lihat Data Pegawai';
        mainEditBtn.disabled = false;
        mainEditBtn.classList.remove('opacity-50', 'cursor-not-allowed');

        document.querySelectorAll('.editable').forEach(cell => cell.setAttribute('contenteditable', 'false'));
        document.querySelectorAll('.delete-col').forEach(col => col.classList.add('hidden'));

        handleKinerjaDateChange();
        handleRekapDateChange();
        saveData();

        enterKinerjaEditMode();
    };

    mainEditBtn.addEventListener('click', () => {
        if (isKinerjaEditMode) {
            exitKinerjaEditMode();
        } else {
            enterKinerjaEditMode();
        }
    });

    showPegawaiDataBtn.addEventListener('click', () => {
        if (isPegawaiDataEditMode) {
            exitPegawaiDataEditMode();
        } else {
            enterPegawaiDataEditMode();
        }
    });

    const sortAndRenderAll = (dataForMonth) => {
        dataForMonth.manajemen.sort((a, b) => {
            const orderA = manajemenOrder[a.jabatan.toUpperCase()] || 99;
            const orderB = manajemenOrder[b.jabatan.toUpperCase()] || 99;
            return (orderA - orderB) || (parseInt(a.nipp) - parseInt(b.nipp));
        });
        dataForMonth.awak.sort((a, b) => {
            const orderA = awakJabatan.indexOf(a.jabatan.toUpperCase());
            const orderB = awakJabatan.indexOf(b.jabatan.toUpperCase());
            return (orderA - orderB) || (parseInt(a.nipp) - parseInt(b.nipp));
        });
        renderTable(dataForMonth.manajemen, manajemenTbody);
        renderTable(dataForMonth.awak, masinisTbody);
    };

    const renderTable = (data, tbody) => {
        const year = parseInt(kinerjaTahunInput.value, 10);
        const monthIndex = parseInt(kinerjaBulan.value, 10);
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        tbody.innerHTML = '';
        data.forEach((pegawai, index) => {
            let calendarCells = '';
            if (!isNaN(daysInMonth)) {
                for (let day = 1; day <= daysInMonth; day++) {
                    const status = pegawai.kinerja ? (pegawai.kinerja[day] || '') : '';
                    const statusInfo = statusMap[status] || { text: '', class: '' };
                    const tabindex = isKinerjaEditMode ? 'tabindex="0"' : '';
                    calendarCells += `<td class="p-2 h-10 border-l border-gray-700 text-center calendar-cell ${statusInfo.class}" ${tabindex} data-day="${day}" data-pegawai-id="${pegawai.id}">${statusInfo.text}</td>`;
                }
            }
            const newRow = document.createElement('tr');
            newRow.className = 'border-b border-gray-700';
            newRow.dataset.id = pegawai.id;
            newRow.innerHTML = `
                <td class="p-3 text-center sticky-col">${index + 1}</td>
                <td class="p-3 editable" data-field="nama" contenteditable="${isPegawaiDataEditMode}">${pegawai.nama}</td>
                <td class="p-3 editable text-center" data-field="nipp" contenteditable="${isPegawaiDataEditMode}">${pegawai.nipp}</td>
                <td class="p-3 editable text-center" data-field="jabatan" contenteditable="${isPegawaiDataEditMode}">${pegawai.jabatan}</td>
                ${calendarCells}
                <td class="p-3 text-center delete-col ${!isPegawaiDataEditMode ? 'hidden' : ''}">
                    <button class="text-red-500 hover:text-red-700 delete-btn">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </td>`;
            tbody.appendChild(newRow);
        });
    };

    [manajemenTbody, masinisTbody].forEach(tbody => {
        tbody.addEventListener('click', (e) => {
            const cell = e.target.closest('.editable');
            if (cell && isPegawaiDataEditMode) {
                const row = cell.closest('tr');
                const pegawaiId = parseInt(row.dataset.id, 10);
                const pegawaiToEdit = allEmployeesMasterList.find(p => p.id === pegawaiId);
                if (pegawaiToEdit) {
                    openPegawaiModal(pegawaiToEdit);
                }
            }

            const deleteButton = e.target.closest('.delete-btn');
            if (deleteButton && isPegawaiDataEditMode) {
                const row = deleteButton.closest('tr');
                const idToDelete = parseInt(row.dataset.id, 10);

                allEmployeesMasterList = allEmployeesMasterList.filter(p => p.id !== idToDelete);

                for (const monthKey in monthlyKinerjaData) {
                    if (monthlyKinerjaData[monthKey][idToDelete]) {
                        delete monthlyKinerjaData[monthKey][idToDelete];
                    }
                }
                for (const monthKey in monthlyCutiData) {
                    monthlyCutiData[monthKey] = monthlyCutiData[monthKey].filter(cuti => cuti.idPegawai !== idToDelete);
                }

                saveData();
                handleKinerjaDateChange();
                handleCutiDateChange();
                handleRekapDateChange();
            }
        });
    });

    pantauanContent.addEventListener('keydown', (e) => {
        const cell = e.target;
        if (!cell.matches('.calendar-cell')) return;

        if (!isKinerjaEditMode) {
            return;
        }

        const key = e.key.toUpperCase();
        const currentCellContent = cell.textContent.trim();
        const isLeaveKey = leaveTypes.includes(currentCellContent);

        if (isLeaveKey && (key === 'BACKSPACE' || key === 'DELETE')) {
            e.preventDefault();
            return;
        }

        if (key === 'BACKSPACE' || key === 'DELETE') {
            e.preventDefault();
            updateKinerjaStatus(cell, null);
            return;
        }

        let statusCode = key;
        if (key === 'F') statusCode = 'LP';

        const statusInfo = statusMap[statusCode];
        if (statusInfo) {
            e.preventDefault();
            updateKinerjaStatus(cell, statusCode);
        }
    });

    function updateKinerjaStatus(cell, statusCode) {
        if (!isKinerjaEditMode) return;

        const pegawaiId = parseInt(cell.dataset.pegawaiId, 10);
        const day = parseInt(cell.dataset.day, 10);
        const year = parseInt(kinerjaTahunInput.value, 10);
        const monthIndex = parseInt(kinerjaBulan.value, 10);
        const monthKey = getMonthKey(year, monthIndex);

        if (!monthlyKinerjaData[monthKey]) monthlyKinerjaData[monthKey] = {};
        if (!monthlyKinerjaData[monthKey][pegawaiId]) monthlyKinerjaData[monthKey][pegawaiId] = {};
        
        const currentStatus = monthlyKinerjaData[monthKey][pegawaiId][day];
        if (currentStatus && statusMap[currentStatus]) {
            const oldStatusClasses = statusMap[currentStatus].class.split(' ');
            cell.classList.remove(...oldStatusClasses);
        }

        if (statusCode === null || currentStatus === statusCode) {
            delete monthlyKinerjaData[monthKey][pegawaiId][day];
            cell.textContent = '';
        } else {
            monthlyKinerjaData[monthKey][pegawaiId][day] = statusCode;
            const statusInfo = statusMap[statusCode];
            cell.textContent = statusInfo.text;
            const newStatusClasses = statusInfo.class.split(' ');
            cell.classList.add(...newStatusClasses);
        }
        
        saveData();
    }

    // --- INITIALIZATION ---
    const refreshAllViews = () => {
        handleKinerjaDateChange();
        handleCutiDateChange();
        handleRekapDateChange();
    }

    const initApp = async () => {
        // Setup UI elements that don't depend on data first
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonthIndex = now.getMonth();

        kinerjaTahunInput.value = currentYear;
        kinerjaBulan.value = currentMonthIndex;
        cutiTahunInput.value = currentYear;
        cutiBulan.value = currentMonthIndex;
        rekapTahunInput.value = currentYear;
        rekapBulan.value = currentMonthIndex;

        setupYearSuggestions(kinerjaTahunInput, kinerjaSuggestions, years, handleKinerjaDateChange);
        setupYearSuggestions(cutiTahunInput, cutiSuggestions, years, handleCutiDateChange);
        setupYearSuggestions(rekapTahunInput, rekapSuggestions, years, handleRekapDateChange);
        setupJabatanSuggestions(jabatanInput, jabatanSuggestions, allJabatan);
        
        setupCoreEventListeners();

        showPegawaiDataBtn.disabled = true;
        showPegawaiDataBtn.classList.add('opacity-50', 'cursor-not-allowed');

        await initDropbox();

        refreshAllViews();
    };

    initApp();
});
