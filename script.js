document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let isKinerjaEditMode = false;
    let isPegawaiDataEditMode = false;
    let isCutiEditMode = false; 
    let isRekapEditMode = false; 
    
    let allEmployeesMasterList = []; // Master list of all employees
    let monthlyKinerjaData = {}; // Stores { 'YYYY-MM': { employeeId: { day: status, ... } } }
    let monthlyCutiData = {}; // Stores { 'YYYY-MM': [{ id, tanggal, nama, nipp, jenis, jabatan, idPegawai }, ...] }

    let calendarDate = new Date();
    let selectedDates = []; 
    let currentEditingPegawaiId = null; 

    // --- KONFIGURASI ---
    const LOCAL_STORAGE_EMPLOYEES_KEY = 'pantauanKinerjaEmployees'; // Kunci untuk master list pegawai
    const LOCAL_STORAGE_MONTHLY_KINERJA_KEY = 'pantauanKinerjaMonthlyKinerja'; // Kunci untuk data kinerja bulanan
    const LOCAL_STORAGE_MONTHLY_CUTI_KEY = 'pantauanKinerjaMonthlyCuti'; // Kunci untuk data cuti bulanan
    const LOCAL_STORAGE_DROPBOX_TOKEN_KEY = 'pantauanKinerjaDropboxToken'; // Kunci untuk token Dropbox

    // PRE-CONFIGURED DROPBOX TOKEN (FOR LOCAL DEVELOPMENT/PERSONAL USE ONLY - NOT SECURE FOR PRODUCTION)
    const PRE_CONFIGURED_DROPBOX_TOKEN = 'sl.u.AF2MQYxsUVBd7F_ZSVUwN0oOJjMvZO1Gy-EaPOgT0i3nplSj297se4LuClLdAUH8fvHghd3SMi07mRYa51GaXdqNpGkMV2shfhfY--TTNT1Omtv0W3fRYXFqqFwnkoOhzTTDte7G_pVxWetCz0nQu3h7mSnWjTc6sXzGNYXdkz64ueTAHrhoSkNgZRJsqLoEHUaT3qZ5oqnkLbu4aiM7XQ-tZ4mkyN1vYW4P_D23VzxAAN8R03ZRC1gel0ixqxH1lGkMQcLZFZMO6YZ992VYRqPIUczAtStS4QpYj6t7iOUtsFBCw-zPpzPrt9yshWKhsKO3p4oEpU26ofpMHtW2_tZ7ucITqjg-mOMTvd0CBTqJ-xe6VJ1JYgkHKvwAf9zhp3PsybXkXAAy_fQteFeBE2u01N9pfUa2HXcg3XSKeP7e3rOZVo8-Ho2u_N6XjEPeX4z_pww3i1E4VIQnbeDQ8TpHpXjJGEyLu7iSgYDUgGJ3hFJVWZLoryrzlYpgNJXJcr6Yx13iXYysPJoGUy3sEeiGSMRDfOjA6YgnCCDNEw4W6w2L9f1KI__29M_qenxjTr7bCO1lyHMr-MaDjRrp7_DnSmeTarhge206FY6C83LldKe3JRRe1Eb95Exb4l2M3TACw3bEnCbztulXFFDvMwE_xt8lM0fRdnobrwRhEqqRUcEoVTrW1SyLvoPdgCrMm1uNV8nXuwe6DxVbF8_bTIg95EjrSxJsq5fLra6rhvP0tzO-6DrcbIbP721uGh815xBuvAazYZKFTGXyDLSHgiX3Ikdg8340HquBqM_K9KQ2HgrjQM-eIybz-F8A9O1IQbjNj_8esRPiSI-jjzKDWuorFOG9SntefrLAf5L89aKKX8CT914RoaVbh11-u0qS1jFrDdHhTuabHRImtyKiYrMEnexp3zDFrntoxpCjDl4ZLjzporq_BmSP8d5ldLvXBYVWPsufyN1DLkGIaPudxXvpBBJSqlN6CX0z8cxGxUJptRLq2AecB9R0cc-To3ueSeHcJPuUsK9cdHc3ir8lKmxWJqt0oRSdlpegUXjkJv03MHhqHpESWZvrAWzUUh0GUSRhpM7gBpVdzj4xjGjkbDZlltb2I5Lax9Jm2DGKsJEnaVSytifiaXRm91Fx9uDLJ3p7kABv1uW2w7XNM4baYDkeeFmczow-ysLc7VOaouChCwn7qJqli6FuM8cQKgZnBrSwoWNEIWRIeRF8rftODVrVvOT8S87jMYdpQ1Dl_xMsSJVOzbksB-UhlsL5bbehOwlwtpeb261OkS1AYaJVz607w3tkwgSUpae5zzyxsis6ww'; // YOUR TOKEN HERE

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

    // --- ELEMENT SELECTORS ---
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
    
    const modal = document.getElementById('pegawaiModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const pegawaiForm = document.getElementById('pegawaiForm');
    const jabatanInput = document.getElementById('jabatan');
    const jabatanSuggestions = document.getElementById('jabatanSuggestions');
    const pegawaiModalTitle = document.getElementById('pegawaiModalTitle');
    const pegawaiModalSubmitBtn = document.getElementById('pegawaiModalSubmitBtn');

    // Cuti Form Modal Elements
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

    // Dropbox Elements
    const syncDropboxBtn = document.getElementById('syncDropboxBtn');
    const dropboxKeyModal = document.getElementById('dropboxKeyModal');
    const closeDropboxKeyModalBtn = document.getElementById('closeDropboxKeyModalBtn');
    const saveDropboxKeyBtn = document.getElementById('saveDropboxKeyBtn');
    const dropboxAccessTokenInput = document.getElementById('dropboxAccessTokenInput');


    // --- DATA SUMBER TAHUN ---
    const years = [];
    const currentYearForList = new Date().getFullYear();
    for (let i = currentYearForList + 5; i >= currentYearForList - 5; i--) {
        years.push(i);
    }
    
    // --- FUNGSI PENGELOLAAN DATA ---
    const getMonthKey = (year, monthIndex) => `${year}-${monthIndex}`;

    /**
     * Mengambil daftar pegawai yang relevan untuk bulan dan tahun tertentu,
     * melapisi data kinerja harian dan cuti bulanan.
     * Pegawai hanya akan muncul jika startDate mereka <= bulan yang sedang dilihat.
     * @param {number} year - Tahun yang dipilih.
     * @param {number} monthIndex - Indeks bulan yang dipilih (0-11).
     * @returns {object} Objek berisi daftar manajemen, awak, dan entri cuti untuk bulan tersebut.
     */
    const getPegawaiForMonth = (year, monthIndex) => {
        const currentMonthKey = getMonthKey(year, monthIndex);
        
        // Filter master list berdasarkan startDate pegawai
        const employeesForMonth = allEmployeesMasterList.filter(emp => {
            if (!emp.startDate) {
                // Jika startDate tidak ada (data lama), asumsikan mereka selalu ada
                return true; 
            }
            const [startYear, startMonth] = emp.startDate.split('-').map(Number);
            // Pegawai disertakan jika tanggal mulai mereka <= bulan yang sedang dilihat
            return (startYear < year) || (startYear === year && startMonth <= monthIndex);
        }).map(emp => JSON.parse(JSON.stringify(emp))); // Deep copy untuk menghindari modifikasi langsung master list

        // Ambil data kinerja spesifik untuk bulan ini
        const monthKinerja = monthlyKinerjaData[currentMonthKey] || {};
        employeesForMonth.forEach(emp => {
            // Lapisi data kinerja harian ke setiap pegawai
            emp.kinerja = monthKinerja[emp.id] ? { ...monthKinerja[emp.id] } : {};
        });

        // Pisahkan pegawai menjadi manajemen dan awak
        const manajemen = employeesForMonth.filter(emp => manajemenOrder.hasOwnProperty(emp.jabatan.toUpperCase()));
        const awak = employeesForMonth.filter(emp => awakJabatan.includes(emp.jabatan.toUpperCase()));

        // Kembalikan data yang digabungkan
        return { 
            manajemen: manajemen, 
            awak: awak, 
            cuti: monthlyCutiData[currentMonthKey] || [] 
        };
    };
    
    /**
     * Membatalkan data kinerja dan cuti untuk bulan-bulan mendatang
     * dari bulan yang diubah dan seterusnya.
     * Ini penting agar data di bulan-bulan mendatang dihitung ulang berdasarkan perubahan terbaru.
     * @param {number} year - Tahun di mana perubahan terjadi.
     * @param {number} monthIndex - Indeks bulan di mana perubahan terjadi.
     */
    const invalidateFutureMonths = (year, monthIndex) => {
        const changedMonthKey = getMonthKey(year, monthIndex);
        console.log(`Invalidating future months from month after ${changedMonthKey} onwards.`);

        for (const key in monthlyKinerjaData) {
            const [keyYear, keyMonth] = key.split('-').map(Number);
            // Hapus hanya jika bulan tersebut *setelah* bulan yang diubah
            if (keyYear > year || (keyYear === year && keyMonth > monthIndex)) {
                delete monthlyKinerjaData[key];
                console.log(`Deleted monthlyKinerjaData for ${key}`);
            }
        }
        for (const key in monthlyCutiData) {
            const [keyYear, keyMonth] = key.split('-').map(Number);
            // Hapus hanya jika bulan tersebut *setelah* bulan yang diubah
            if (keyYear > year || (keyYear === year && keyMonth > monthIndex)) {
                delete monthlyCutiData[key];
                console.log(`Deleted monthlyCutiData for ${key}`);
            }
        }
        saveData(); // Simpan data setelah membatalkan bulan-bulan mendatang
    };

    /**
     * Menyimpan semua data aplikasi ke localStorage.
     */
    const saveData = () => {
        localStorage.setItem(LOCAL_STORAGE_EMPLOYEES_KEY, JSON.stringify(allEmployeesMasterList));
        localStorage.setItem(LOCAL_STORAGE_MONTHLY_KINERJA_KEY, JSON.stringify(monthlyKinerjaData));
        localStorage.setItem(LOCAL_STORAGE_MONTHLY_CUTI_KEY, JSON.stringify(monthlyCutiData));
        console.log('Data saved to localStorage.');
    };

    /**
     * Memuat semua data aplikasi dari localStorage.
     */
    const loadData = () => {
        try {
            const storedEmployees = localStorage.getItem(LOCAL_STORAGE_EMPLOYEES_KEY);
            if (storedEmployees) allEmployeesMasterList = JSON.parse(storedEmployees);
            else allEmployeesMasterList = [];

            const storedKinerja = localStorage.getItem(LOCAL_STORAGE_MONTHLY_KINERJA_KEY);
            if (storedKinerja) monthlyKinerjaData = JSON.parse(storedKinerja);
            else monthlyKinerjaData = {};

            const storedCuti = localStorage.getItem(LOCAL_STORAGE_MONTHLY_CUTI_KEY);
            if (storedCuti) monthlyCutiData = JSON.parse(storedCuti);
            else monthlyCutiData = {};

            console.log('Data loaded from localStorage.');
        } catch (e) {
            console.error('Error loading data from localStorage:', e);
            allEmployeesMasterList = [];
            monthlyKinerjaData = {};
            monthlyCutiData = {};
        }
    };
    
    /**
     * Mengubah format tanggal 'YYYY-MM-DD' menjadi format tampilan lokal.
     * @param {string} dateStr - Tanggal dalam format 'YYYY-MM-DD'.
     * @returns {string} Tanggal dalam format lokal (misal: "01 Januari 2023").
     */
    const formatDateToDisplay = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    /**
     * Mengurai format tanggal tampilan lokal menjadi objek Date.
     * @param {string} displayDate - Tanggal dalam format tampilan lokal.
     * @returns {Date|null} Objek Date atau null jika format tidak valid.
     */
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

    /**
     * Menampilkan modal notifikasi dengan pesan tertentu.
     * @param {string} message - Pesan yang akan ditampilkan.
     */
    function showNotification(message) {
        notificationMessage.textContent = message;
        notificationModal.classList.remove('hidden');
    }
    closeNotificationModalBtn.addEventListener('click', () => {
        notificationModal.classList.add('hidden');
    });

    /**
     * Mengisi grid kalender di modal kalender.
     */
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
            dateCell.className = 'p-2 text-center cursor-pointer hover:bg-gray-700 rounded-full'; // Updated hover color for dark mode
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

    /**
     * Memperbarui header tabel kalender dengan hari dan tanggal yang benar.
     * @param {number} year - Tahun yang dipilih.
     * @param {number} monthIndex - Indeks bulan yang dipilih.
     */
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
                ? 'p-3 text-center w-10 font-semibold bg-red-800 text-red-200' // Adjusted for dark mode
                : 'p-3 text-center w-10 font-semibold';
            headerHTML += `<th class="${thClass}">${dayName}<br>${day}</th>`;
        }

        headerHTML += `<th class="p-3 w-16 text-center font-semibold delete-col ${!isPegawaiDataEditMode ? 'hidden' : ''}">AKSI</th></tr>`;
        manajemenThead.innerHTML = headerHTML;
        masinisThead.innerHTML = headerHTML;
    };

    /**
     * Merender tabel cuti bulanan.
     * @param {Array<Object>} dataCutiForSelectedMonth - Data cuti yang difilter untuk bulan yang dipilih.
     */
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

    /**
     * Merender tabel rekapitulasi cuti tahunan untuk manajemen dan awak.
     * @param {Array<Object>} manajemen - Daftar pegawai manajemen.
     * @param {Array<Object>} awak - Daftar pegawai awak.
     */
    const renderCutiTahunanTables = (manajemen, awak) => {
        const render = (data, tbody, isEditModeForRekap) => {
            tbody.innerHTML = '';
            if (!data) return;
            data.forEach((pegawai, index) => {
                // Hitung 'diambil' secara dinamis untuk rekap cuti tahunan
                let diambilCount = 0;
                const currentYear = parseInt(rekapTahunInput.value, 10);
                
                // Loop through all months of the current year for this employee
                for (let m = 0; m < 12; m++) { // Loop through all 12 months
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

    // --- FUNGSI TANGGAL CHANGE ---
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
             // Pass only the cuti data for the selected month to renderCutiTable
             renderCutiTable(monthlyCutiData[getMonthKey(year, monthIndex)] || []);
        }
    };
    
    const handleRekapDateChange = () => {
        const year = parseInt(rekapTahunInput.value, 10);
        const monthIndex = parseInt(rekapBulan.value, 10);
        if (!isNaN(year) && year.toString().length === 4 && !isNaN(monthIndex)) {
             // getPegawaiForMonth will fetch from master list and then calculate 'diambil' dynamically
             const dataForMonth = getPegawaiForMonth(year, monthIndex); 
             renderCutiTahunanTables(dataForMonth.manajemen, dataForMonth.awak);
        }
    };

    // --- INITIALIZATION ---
    const initApp = () => {
        loadData(); // Load all data from localStorage at app initialization
        document.documentElement.classList.add('dark'); // Ensure dark mode is always on

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

        handleKinerjaDateChange(); 
        handleCutiDateChange();
        handleRekapDateChange();

        // Initialize button states
        showPegawaiDataBtn.disabled = true;
        showPegawaiDataBtn.classList.add('opacity-50', 'cursor-not-allowed');

        // Check for Dropbox access token in URL (after redirect from OAuth) - less relevant now with pre-configured token
        const params = new URLSearchParams(window.location.hash.substring(1));
        const accessTokenFromUrl = params.get('access_token');
        if (accessTokenFromUrl) {
            localStorage.setItem(LOCAL_STORAGE_DROPBOX_TOKEN_KEY, accessTokenFromUrl);
            showNotification('Dropbox berhasil dihubungkan dari URL!');
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (!localStorage.getItem(LOCAL_STORAGE_DROPBOX_TOKEN_KEY) && PRE_CONFIGURED_DROPBOX_TOKEN) {
            // If no token in localStorage and a pre-configured one exists, use it
            localStorage.setItem(LOCAL_STORAGE_DROPBOX_TOKEN_KEY, PRE_CONFIGURED_DROPBOX_TOKEN);
            showNotification('Token Dropbox pre-konfigurasi berhasil dimuat.');
        }

        initializeDropboxClient(); // Initialize Dropbox client and update button status on init
    };
    
    // --- FUNGSI DROPDOWN KUSTOM ---
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
        
        // Hanya tampilkan saran saat input memiliki nilai
        inputElement.addEventListener('input', () => {
            const currentValue = inputElement.value.trim(); // Gunakan trim() untuk menghapus spasi di awal/akhir
            if (currentValue.length > 0) { // Hanya tampilkan jika ada input
                const filtered = jabatanData.filter(j => j.toUpperCase().includes(currentValue.toUpperCase()));
                showSuggestions(filtered);
            } else {
                suggestionsElement.classList.add('hidden'); // Sembunyikan jika input kosong
            }
        });

        // Sembunyikan saran saat fokus hilang dari input atau diklik di luar
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

    // --- EVENT LISTENERS ---
    kinerjaBulan.addEventListener('change', handleKinerjaDateChange);
    kinerjaTahunInput.addEventListener('change', handleKinerjaDateChange);
    cutiBulan.addEventListener('change', handleCutiDateChange);
    cutiTahunInput.addEventListener('change', handleCutiDateChange);
    rekapBulan.addEventListener('change', handleRekapDateChange);
    rekapTahunInput.addEventListener('change', handleRekapDateChange);

    // --- TAB LOGIC ---
    formTab.addEventListener('click', (e) => {
        e.preventDefault();
        formTab.classList.add('tab-active');
        pantauanTab.classList.remove('tab-active');
        // Set pantauanTab color when formTab is active
        pantauanTab.classList.remove('bg-gray-700', 'font-semibold', 'text-gray-50');
        pantauanTab.classList.add('text-gray-300', 'font-medium', 'hover:bg-gray-700'); // Updated for dark mode

        formContent.classList.remove('hidden');
        pantauanContent.classList.add('hidden');
    });
    pantauanTab.addEventListener('click', (e) => {
        e.preventDefault();
        pantauanTab.classList.add('tab-active');
        formTab.classList.remove('tab-active');
        // Set formTab color when pantauanTab is active
        formTab.classList.remove('bg-gray-700', 'font-semibold', 'text-gray-50');
        formTab.classList.add('text-gray-300', 'font-medium', 'hover:bg-gray-700'); // Updated for dark mode

        pantauanContent.classList.remove('hidden');
        formContent.classList.add('hidden');
    });

    // --- FUNGSI EDIT MODE CUTI & REKAP ---
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
        saveData(); // Save data after exiting cuti edit mode
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
        const key = getMonthKey(year, monthIndex);
        
        // Update totalCutiTahunan in allEmployeesMasterList
        document.querySelectorAll('#cutiManajemenTbody tr').forEach(row => {
            const id = parseInt(row.dataset.id, 10);
            const pegawai = allEmployeesMasterList.find(p => p.id === id);
            if (pegawai) {
                pegawai.totalCutiTahunan = parseInt(row.querySelector('[data-field="totalCutiTahunan"]').textContent, 10) || 0;
            }
        });
        document.querySelectorAll('#cutiAwakTbody tr').forEach(row => {
            const id = parseInt(row.dataset.id, 10);
            const pegawai = allEmployeesMasterList.find(p => p.id === id);
            if (pegawai) {
                pegawai.totalCutiTahunan = parseInt(row.querySelector('[data-field="totalCutiTahunan"]').textContent, 10) || 0;
            }
        });

        invalidateFutureMonths(year, monthIndex); // Invalidate future months to re-calculate 'diambil'
        handleRekapDateChange();
        saveData(); // Save data after exiting rekap edit mode
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
            
            // Temukan entri cuti yang akan dihapus untuk mendapatkan detailnya
            const cutiEntryToDelete = monthlyCutiData[key]?.find(c => c.id === cutiId);

            // Hapus dari monthlyCutiData
            if (monthlyCutiData[key]) {
                monthlyCutiData[key] = monthlyCutiData[key].filter(c => c.id !== cutiId);
            }

            // BARU: Hapus juga status yang sesuai dari monthlyKinerjaData
            if (cutiEntryToDelete) {
                const dateParts = cutiEntryToDelete.tanggal.split(' '); // e.g., "01 Januari 2023"
                const day = parseInt(dateParts[0], 10);
                const employeeId = cutiEntryToDelete.idPegawai;

                if (monthlyKinerjaData[key] && monthlyKinerjaData[key][employeeId]) {
                    delete monthlyKinerjaData[key][employeeId][day];
                    // Jika entri karyawan untuk bulan itu menjadi kosong, bersihkan
                    if (Object.keys(monthlyKinerjaData[key][employeeId]).length === 0) {
                        delete monthlyKinerjaData[key][employeeId];
                    }
                    // Jika entri bulan menjadi kosong, bersihkan
                    if (Object.keys(monthlyKinerjaData[key]).length === 0) {
                        delete monthlyKinerjaData[key];
                    }
                }
            }

            // Propagasi perubahan ke bulan-bulan mendatang (untuk perhitungan 'diambil')
            invalidateFutureMonths(year, monthIndex);
            
            // Refresh semua tampilan
            handleCutiDateChange();
            handleRekapDateChange();
            handleKinerjaDateChange();
            saveData(); // Simpan data setelah menghapus entri cuti
        }
    });

    // --- MODAL PEGAWAI (ADD/EDIT) ---
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

        if (currentEditingPegawaiId) {
            // Edit existing pegawai in master list
            const pegawaiToUpdate = allEmployeesMasterList.find(p => p.id === currentEditingPegawaiId);

            if (pegawaiToUpdate) {
                pegawaiToUpdate.nama = nama;
                pegawaiToUpdate.nipp = nipp;
                pegawaiToUpdate.jabatan = jabatan;
                pegawaiToUpdate.totalCutiTahunan = totalCutiTahunan;
                console.log('Pegawai updated in master list:', pegawaiToUpdate);
            }
        } else {
            // Add new pegawai to master list
            const newPegawai = {
                id: Date.now(),
                nama: nama,
                nipp: nipp,
                jabatan: jabatan,
                totalCutiTahunan: totalCutiTahunan,
                startDate: getMonthKey(parseInt(kinerjaTahunInput.value, 10), parseInt(kinerjaBulan.value, 10)) // Set start date for new employee
            };
            allEmployeesMasterList.push(newPegawai);
            console.log('New pegawai added to master list:', newPegawai);
        }

        saveData(); // Simpan master list pegawai
        
        // Re-render semua tabel karena daftar pegawai master berubah
        handleKinerjaDateChange(); 
        handleCutiDateChange();
        handleRekapDateChange();
        closePegawaiModal();
    });

    // --- LOGIKA BARU UNTUK FORMULIR CUTI ---
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
        
        const year = parseInt(kinerjaTahunInput.value, 10);
        const monthIndex = parseInt(kinerjaBulan.value, 10);
        // Cek pegawai dari master list
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
            // Hitung total cuti yang sudah diambil untuk tahun ini
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
            
            for(const dateStr of selectedDates) {
                const date = new Date(dateStr + 'T00:00:00');
                const kinerjaMonthKey = getMonthKey(date.getFullYear(), date.getMonth());
                // We need to check the actual count of CT for this day across all employees
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

        // Lanjutkan jika validasi lolos
        selectedDates.forEach(dateStr => {
            const date = new Date(dateStr + 'T00:00:00');
            const year = date.getFullYear();
            const month = date.getMonth();
            const day = date.getDate();

            const monthKey = getMonthKey(year, month);
            
            // Pastikan objek bulan ada di monthlyCutiData
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
                idPegawai: employeeInMasterList.id // Add employee ID for linking
            };
            monthlyCutiData[monthKey].push(newCutiEntry);

            // Perbarui status kinerja harian di monthlyKinerjaData
            if (!monthlyKinerjaData[monthKey]) {
                monthlyKinerjaData[monthKey] = {};
            }
            if (!monthlyKinerjaData[monthKey][employeeInMasterList.id]) {
                monthlyKinerjaData[monthKey][employeeInMasterList.id] = {};
            }
            monthlyKinerjaData[monthKey][employeeInMasterList.id][day] = jenis;
        });

        // Invalidate future months to ensure 'diambil' counts are re-calculated
        const lastLeaveDate = new Date(selectedDates[selectedDates.length - 1] + 'T00:00:00');
        invalidateFutureMonths(lastLeaveDate.getFullYear(), lastLeaveDate.getMonth());
        
        handleCutiDateChange();
        handleRekapDateChange();
        handleKinerjaDateChange();
        closeCutiFormModal();
        saveData(); 
    });


    // --- FUNGSI EDIT MODE KINERJA ---
    const enterKinerjaEditMode = () => {
        isKinerjaEditMode = true;
        isPegawaiDataEditMode = false; // Ensure other mode is off
        showPegawaiDataBtn.classList.remove('bg-green-600', 'hover:bg-green-700'); // Reset person icon color
        showPegawaiDataBtn.classList.add('bg-blue-500', 'hover:bg-blue-600'); // Set to default blue
        showPegawaiDataTooltip.textContent = 'Lihat Data Pegawai'; // Reset person icon tooltip

        mainEditBtn.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
        mainEditBtn.classList.add('bg-green-600', 'hover:bg-green-700');
        mainEditTooltip.textContent = 'Simpan Perubahan Kinerja'; 
        addPegawaiContainer.classList.remove('hidden');
        showPegawaiDataContainer.classList.remove('hidden');
        showPegawaiDataBtn.disabled = false; // Enable person icon button
        showPegawaiDataBtn.classList.remove('opacity-50', 'cursor-not-allowed'); 

        // Disable editing of Nama, NIPP, Jabatan cells and hide delete column
        document.querySelectorAll('.editable').forEach(cell => cell.setAttribute('contenteditable', 'false'));
        document.querySelectorAll('.delete-col').forEach(col => col.classList.add('hidden'));

        // Allow editing of calendar cells
        document.querySelectorAll('.calendar-cell').forEach(cell => cell.setAttribute('tabindex', '0'));
        
        // Re-render table to apply contenteditable changes
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

        // Disable editing of calendar cells
        document.querySelectorAll('.calendar-cell').forEach(cell => cell.removeAttribute('tabindex'));

        // Re-render table to reflect non-editable state
        handleKinerjaDateChange();
        saveData(); // Save data after exiting kinerja edit mode
    };

    // --- FUNGSI EDIT MODE DATA PEGAWAI ---
    const enterPegawaiDataEditMode = () => {
        isPegawaiDataEditMode = true;
        isKinerjaEditMode = false; // Ensure other mode is off
        mainEditBtn.classList.remove('bg-green-600', 'hover:bg-green-700'); // Reset pencil icon color
        mainEditBtn.classList.add('bg-yellow-500', 'hover:bg-yellow-600'); // Set to default yellow
        mainEditTooltip.textContent = 'Edit Kinerja'; // Reset pencil icon tooltip

        showPegawaiDataBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
        showPegawaiDataBtn.classList.add('bg-green-600', 'hover:bg-green-700');
        showPegawaiDataTooltip.textContent = 'Simpan Data Pegawai';
        mainEditBtn.disabled = true; // Lock pencil icon
        mainEditBtn.classList.add('opacity-50', 'cursor-not-allowed'); 

        // Enable editing of Nama, NIPP, Jabatan cells and show delete column
        document.querySelectorAll('.editable').forEach(cell => cell.setAttribute('contenteditable', 'true'));
        document.querySelectorAll('.delete-col').forEach(col => col.classList.remove('hidden'));

        // Disable editing of calendar cells
        document.querySelectorAll('.calendar-cell').forEach(cell => cell.removeAttribute('tabindex'));

        // Re-render table to apply contenteditable changes
        handleKinerjaDateChange();
    };

    const exitPegawaiDataEditMode = () => {
        isPegawaiDataEditMode = false;
        showPegawaiDataBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
        showPegawaiDataBtn.classList.add('bg-blue-500', 'hover:bg-blue-600');
        showPegawaiDataTooltip.textContent = 'Lihat Data Pegawai';
        mainEditBtn.disabled = false; // Unlock pencil icon
        mainEditBtn.classList.remove('opacity-50', 'cursor-not-allowed'); 

        // Disable editing of Nama, NIPP, Jabatan cells and hide delete column
        document.querySelectorAll('.editable').forEach(cell => cell.setAttribute('contenteditable', 'false'));
        document.querySelectorAll('.delete-col').forEach(col => col.classList.add('hidden'));
        
        // Save changes from editable cells (Nama, NIPP, Jabatan)
        // These changes are already saved to allEmployeesMasterList via pegawaiForm.submit
        
        // Re-render tables to reflect non-editable state and updated data
        handleKinerjaDateChange();
        handleRekapDateChange();
        saveData(); 

        // Automatically enter Kinerja Edit Mode after exiting Pegawai Data Edit Mode
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

    // --- TABLE MANIPULATION & SORTING ---
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
                    const tabindex = isKinerjaEditMode ? 'tabindex="0"' : ''; // Only tabindex if in Kinerja edit mode
                    calendarCells += `<td class="p-2 h-10 border-l border-gray-700 text-center calendar-cell ${statusInfo.class}" ${tabindex} data-day="${day}" data-pegawai-id="${pegawai.id}">${statusInfo.text}</td>`; // Updated border color
                }
            }
            const newRow = document.createElement('tr');
            newRow.className = 'border-b border-gray-700'; // Updated border color
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
    
    // Event listener for editing pegawai data via table cells
    [manajemenTbody, masinisTbody].forEach(tbody => {
        tbody.addEventListener('click', (e) => {
            const cell = e.target.closest('.editable');
            if (cell && isPegawaiDataEditMode) {
                const row = cell.closest('tr');
                const pegawaiId = parseInt(row.dataset.id, 10);
                // Get employee from master list
                const pegawaiToEdit = allEmployeesMasterList.find(p => p.id === pegawaiId);
                if (pegawaiToEdit) {
                    openPegawaiModal(pegawaiToEdit);
                }
            }

            const deleteButton = e.target.closest('.delete-btn');
            if (deleteButton && isPegawaiDataEditMode) {
                const row = deleteButton.closest('tr');
                const idToDelete = parseInt(row.dataset.id, 10);
                
                // Remove from master list
                allEmployeesMasterList = allEmployeesMasterList.filter(p => p.id !== idToDelete);
                console.log('Pegawai deleted from master list. New master list:', allEmployeesMasterList);

                // Also remove their specific monthly data
                for (const monthKey in monthlyKinerjaData) {
                    if (monthlyKinerjaData[monthKey][idToDelete]) {
                        delete monthlyKinerjaData[monthKey][idToDelete];
                    }
                }
                for (const monthKey in monthlyCutiData) {
                    monthlyCutiData[monthKey] = monthlyCutiData[monthKey].filter(cuti => cuti.idPegawai !== idToDelete); // Assuming cuti entries also link to pegawaiId
                }
                
                saveData(); // Save updated master list and monthly data

                // Re-render all affected tables
                handleKinerjaDateChange();
                handleCutiDateChange(); // Re-render cuti table as well
                handleRekapDateChange(); // Re-render rekap table as well
            }
        });
    });
    
    pantauanContent.addEventListener('keydown', (e) => {
        const cell = e.target;
        if (!cell.matches('.calendar-cell')) return;

        console.log('Keydown event on calendar cell:', {
            isKinerjaEditMode: isKinerjaEditMode,
            key: e.key,
            cellTextContent: cell.textContent,
            isLeaveKeyCheck: leaveTypes.includes(cell.textContent.trim()) 
        });

        // Only allow changes if in Kinerja Edit Mode
        if (!isKinerjaEditMode) {
            console.log('Not in Kinerja Edit Mode. Ignoring keydown.');
            return;
        }

        const key = e.key.toUpperCase();
        const currentCellContent = cell.textContent.trim(); // Trim whitespace
        const isLeaveKey = leaveTypes.includes(currentCellContent);

        if (isLeaveKey && (key === 'BACKSPACE' || key === 'DELETE')) {
            console.log('Attempted to delete a leave type. Prevented.');
            e.preventDefault();
            return; 
        }
        
        if (key === 'BACKSPACE' || key === 'DELETE') {
             console.log('Attempted to delete non-leave type. Calling updateKinerjaStatus with null.');
             e.preventDefault();
             updateKinerjaStatus(cell, null); 
             return;
        }

        let statusCode = key;
        if (key === 'F') statusCode = 'LP';
        
        const statusInfo = statusMap[statusCode];
        if (statusInfo) {
            console.log('Valid status key pressed. Calling updateKinerjaStatus with:', statusCode);
            e.preventDefault();
            updateKinerjaStatus(cell, statusCode);
        } else {
            console.log('Invalid key pressed for status:', key);
        }
    });

    function updateKinerjaStatus(cell, statusCode) {
        if (!isKinerjaEditMode) return; 

        const pegawaiId = parseInt(cell.dataset.pegawaiId, 10);
        const day = parseInt(cell.dataset.day, 10);

        const year = parseInt(kinerjaTahunInput.value, 10);
        const monthIndex = parseInt(kinerjaBulan.value, 10);
        const monthKey = getMonthKey(year, monthIndex);
        
        // Pastikan objek bulan dan pegawai ada di monthlyKinerjaData
        if (!monthlyKinerjaData[monthKey]) {
            monthlyKinerjaData[monthKey] = {};
        }
        if (!monthlyKinerjaData[monthKey][pegawaiId]) {
            monthlyKinerjaData[monthKey][pegawaiId] = {};
        }

        if (statusCode === null || monthlyKinerjaData[monthKey][pegawaiId][day] === statusCode) {
            delete monthlyKinerjaData[monthKey][pegawaiId][day];
            cell.textContent = '';
            // Remove all status-related classes
            Object.values(statusMap).forEach(info => {
                cell.classList.remove(info.class);
            });
            cell.className = 'p-2 h-10 border-l border-gray-700 text-center calendar-cell'; // Reset to base classes, updated border
        } else {
            // Remove all previous status classes before adding new one
            Object.values(statusMap).forEach(info => {
                cell.classList.remove(info.class);
            });
            monthlyKinerjaData[monthKey][pegawaiId][day] = statusCode;
            const statusInfo = statusMap[statusCode];
            cell.textContent = statusInfo.text;
            cell.classList.add(statusInfo.class); // Add new status class
            cell.className = `p-2 h-10 border-l border-gray-700 text-center calendar-cell ${statusInfo.class}`; // Updated border
        }
        
        // Invalidate future months from current month onwards to re-calculate 'diambil'
        invalidateFutureMonths(year, monthIndex); 
        saveData(); // Save data after updating kinerja status
    }

    // --- DROPBOX INTEGRATION ---
    // Initialize dropboxAccessToken from localStorage or the pre-configured token
    let dropboxAccessToken = localStorage.getItem(LOCAL_STORAGE_DROPBOX_TOKEN_KEY) || PRE_CONFIGURED_DROPBOX_TOKEN;
    let dbx; // Dropbox client object

    const initializeDropboxClient = () => {
        // Only set dbx if dropboxAccessToken is present
        if (dropboxAccessToken) {
            dbx = new Dropbox.Dropbox({ accessToken: dropboxAccessToken });
            console.log('Dropbox client initialized.');
            createDropboxFolder('PKPC'); // Attempt to create folder when client is initialized
        } else {
            dbx = null;
            console.log('Dropbox access token not found. Dropbox client not initialized.');
        }
        updateDropboxButtonStatus(); // Update button status after initializing client
    };

    /**
     * Creates a specified folder in the user's Dropbox account.
     * @param {string} folderName - The name of the folder to create.
     */
    const createDropboxFolder = async (folderName) => {
        if (!dbx) {
            console.warn('Dropbox client not initialized. Cannot create folder.');
            return;
        }

        try {
            // Check if the folder already exists to avoid errors
            await dbx.filesGetMetadata({ path: `/${folderName}` });
            console.log(`Folder "${folderName}" already exists.`);
        } catch (error) {
            if (error.status === 409) { // Conflict (e.g., folder already exists)
                console.log(`Folder "${folderName}" already exists (status 409).`);
            } else if (error.status === 404) { // Not Found, so we can create it
                try {
                    await dbx.filesCreateFolderV2({ path: `/${folderName}` });
                    showNotification(`Folder "PKPC" berhasil dibuat di Dropbox Anda.`);
                    console.log(`Folder "${folderName}" created successfully.`);
                } catch (createError) {
                    console.error(`Error creating folder "${folderName}":`, createError);
                    showNotification(`Gagal membuat folder "PKPC" di Dropbox: ${createError.message || 'Terjadi kesalahan.'}`);
                }
            } else {
                console.error(`Error checking for folder "${folderName}":`, error);
                showNotification(`Gagal memeriksa folder "PKPC" di Dropbox: ${error.message || 'Terjadi kesalahan.'}`);
            }
        }
    };

    /**
     * Updates the appearance of the Dropbox sync button based on token availability.
     */
    const updateDropboxButtonStatus = () => {
        if (localStorage.getItem(LOCAL_STORAGE_DROPBOX_TOKEN_KEY)) {
            syncDropboxBtn.classList.remove('bg-purple-600', 'hover:bg-purple-700');
            syncDropboxBtn.classList.add('bg-green-600', 'hover:bg-green-700');
            syncDropboxTooltip.textContent = 'Dropbox Terhubung';
            // Hide the access token input field if already connected
            document.querySelector('#dropboxAccessTokenInput').closest('.mb-4').classList.add('hidden');
        } else {
            syncDropboxBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
            syncDropboxBtn.classList.add('bg-purple-600', 'hover:bg-purple-700');
            syncDropboxTooltip.textContent = 'Sinkronisasi ke Dropbox';
            // Show the access token input field if not connected
            document.querySelector('#dropboxAccessTokenInput').closest('.mb-4').classList.remove('hidden');
        }
    };

    // Open the Dropbox API Key input modal
    syncDropboxBtn.addEventListener('click', () => {
        const hasToken = localStorage.getItem(LOCAL_STORAGE_DROPBOX_TOKEN_KEY);
        if (hasToken) {
            // If token exists, try to upload immediately (as before)
            uploadDataToDropbox();
        } else {
            // If no token, show the modal
            dropboxAccessTokenInput.value = ''; // Clear previous input
            dropboxKeyModal.classList.remove('hidden');
        }
    });

    // Close the Dropbox API Key input modal
    closeDropboxKeyModalBtn.addEventListener('click', () => {
        dropboxKeyModal.classList.add('hidden');
    });

    // Save the entered Dropbox API Key
    saveDropboxKeyBtn.addEventListener('click', () => {
        const newToken = dropboxAccessTokenInput.value.trim();
        if (newToken) {
            localStorage.setItem(LOCAL_STORAGE_DROPBOX_TOKEN_KEY, newToken);
            dropboxAccessToken = newToken; // Update the global variable
            initializeDropboxClient(); // This will now also attempt to create the folder
            showNotification('Token akses Dropbox berhasil disimpan.');
            dropboxKeyModal.classList.add('hidden');
        } else {
            localStorage.removeItem(LOCAL_STORAGE_DROPBOX_TOKEN_KEY);
            dropboxAccessToken = null; // Clear the global variable
            initializeDropboxClient();
            showNotification('Token akses Dropbox dihapus.');
            dropboxKeyModal.classList.add('hidden');
        }
    });

    // Function to upload data to Dropbox
    const uploadDataToDropbox = async () => {
        if (!dbx) {
            showNotification('Token akses Dropbox belum diatur. Silakan atur token Anda terlebih dahulu.');
            return;
        }

        try {
            const dataToUpload = {
                employees: allEmployeesMasterList,
                kinerja: monthlyKinerjaData,
                cuti: monthlyCutiData
            };
            const fileContent = JSON.stringify(dataToUpload, null, 2);
            // File will be saved inside the PKPC folder
            const fileName = `/PKPC/pantauan_kinerja_${new Date().toISOString().slice(0, 10)}.json`; 

            const response = await dbx.filesUpload({
                path: fileName,
                contents: fileContent,
                mode: { '.tag': 'overwrite' } // Overwrite if file exists
            });

            console.log('File uploaded successfully:', response);
            showNotification(`Data berhasil disinkronkan ke Dropbox sebagai "${fileName}"!`);
        } catch (error) {
            console.error('Error uploading to Dropbox:', error);
            if (error.status === 401) {
                showNotification('Token akses Dropbox tidak valid atau kedaluwarsa. Mohon perbarui.');
                localStorage.removeItem(LOCAL_STORAGE_DROPBOX_TOKEN_KEY); // Clear invalid token
                dropboxAccessToken = null;
                initializeDropboxClient();
            } else {
                showNotification(`Gagal sinkronisasi ke Dropbox: ${error.message || 'Terjadi kesalahan.'}`);
            }
        }
    };

    // Jalankan inisialisasi aplikasi
    initApp();
});