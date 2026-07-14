document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const indicator = document.getElementById('page-indicator');
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    const logicalTotal = 16;
    
    let slideSteps = { 1: 0, 2: 0, 3: 0, 4: 0 };
    const maxSteps = { 1: 1, 2: 6, 3: 3 };

    let autoAnimInterval = null;
    const params = new URLSearchParams(window.location.search);
    const autoPlayResults = params.get('auto') !== '0';
    const previewMode = params.has('slide') || params.has('step') || params.has('chartStep');

    if (previewMode) {
        document.body.classList.add('preview-mode');
    }

    applyPreviewParams();

    function applyPreviewParams() {
        const requestedSlide = params.has('slide') ? Number(params.get('slide')) : NaN;
        const requestedStep = params.has('step') ? Number(params.get('step')) : NaN;
        const requestedChartStep = params.has('chartStep') ? Number(params.get('chartStep')) : NaN;

        if (Number.isInteger(requestedSlide) && requestedSlide >= 1 && requestedSlide <= totalSlides) {
            currentSlide = requestedSlide - 1;
        }

        if (Number.isInteger(requestedStep) && maxSteps[currentSlide] !== undefined) {
            slideSteps[currentSlide] = Math.max(0, Math.min(maxSteps[currentSlide], requestedStep));
        }

        if (currentSlide === 4 && Number.isInteger(requestedChartStep)) {
            slideSteps[4] = Math.max(0, Math.min(8, requestedChartStep));
        }
    }

    function getLogicalPage() {
        if (currentSlide === 1) return 2 + slideSteps[1];
        if (currentSlide === 2) return 4 + slideSteps[2];
        if (currentSlide === 3) return 11 + slideSteps[3];
        if (currentSlide > 3) return currentSlide + 11;
        return currentSlide + 1;
    }

    function updateIndicator() {
        indicator.textContent = `${getLogicalPage()} / ${logicalTotal}`;
    }

    function updateNavButtons() {
        const isFirst = currentSlide === 0;
        const isLast = currentSlide === totalSlides - 1;

        prevBtn.disabled = isFirst;
        nextBtn.disabled = isLast;
    }

    function updateSlides() {
        slides.forEach((slide, index) => {
            if (index === currentSlide) {
                slide.classList.add('active');
                slide.classList.remove('animating-in');
                void slide.offsetWidth;
                slide.classList.add('animating-in');
                slide.scrollTop = 0;
                slide.scrollLeft = 0;
            } else {
                slide.classList.remove('active');
                slide.classList.remove('animating-in');
            }
        });
        
        updateIndicator();
        
        updateNavButtons();
        if (currentSlide === 2 && !window.molInitialized) {
            init3Dmol();
            window.molInitialized = true;
        }
        if (currentSlide === 4 && !window.chartInitialized) {
            initChart();
            window.chartInitialized = true;
        }

        if (currentSlide === 1) {
            updateAnimState1();
        }
        if (currentSlide === 2) {
            updateAnimState2();
        }
        if (currentSlide === 3) {
            updateAnimState3();
        }
        
        if (currentSlide === 4 && autoPlayResults) {
            startAutoAnimation4();
        } else if (currentSlide === 4) {
            showFinalResults();
        } else {
            stopAutoAnimation4();
        }
    }

    function updateAnimState1() {
        const step = slideSteps[1];
        const titleReason = document.getElementById('title-reason');
        const boxPhoto = document.getElementById('box-photo');
        const item1 = document.getElementById('list-item-1');
        const item2 = document.getElementById('list-item-2');
        const item3 = document.getElementById('list-item-3');

        if (step === 0) {
            titleReason.classList.remove('hidden');
            item1.classList.remove('step1');
            item2.classList.remove('step1');
            item3.classList.remove('step1');
            boxPhoto.classList.remove('step1');
        } else if (step === 1) {
            titleReason.classList.add('hidden');
            item1.classList.add('step1');
            item2.classList.add('step1');
            item3.classList.add('step1');
            boxPhoto.classList.add('step1');
        }
    }

    function updateAnimState2() {
        const stage = document.getElementById('theory-stage');
        if (!stage) return;

        stage.classList.remove('step-0', 'step-1', 'step-2', 'step-3', 'step-4', 'step-5', 'step-6');
        stage.classList.add(`step-${slideSteps[2]}`);
    }

    function updateAnimState3() {
        const step = slideSteps[3];
        const titleHypo = document.getElementById('title-hypo');
        const titleSetup = document.getElementById('title-setup');
        const titleMeasure = document.getElementById('title-measure');
        const titleSummary = document.getElementById('title-summary');
        const boxHypo = document.getElementById('box-hypo');
        const boxSetup = document.getElementById('box-setup');
        const boxMeasure = document.getElementById('box-measure');
        //con
        // Reset
        boxHypo.className = 'hypothesis-box anim-box';
        boxSetup.className = 'box anim-box';
        boxMeasure.className = 'box anim-box';
        titleHypo.classList.add('hidden');
        titleSetup.classList.add('hidden');
        titleMeasure.classList.add('hidden');
        
        titleSummary.classList.add('hidden');
        if (step === 0) {
            titleHypo.classList.remove('hidden');
            boxSetup.classList.add('hidden');
            boxMeasure.classList.add('hidden');
        } else if (step === 1) {
            titleSetup.classList.remove('hidden');
            boxHypo.classList.add('step1');
            boxSetup.classList.add('step1');
            boxMeasure.classList.add('hidden');
        } else if (step === 2) {
            titleMeasure.classList.remove('hidden');
            boxHypo.classList.add('step2');
            boxSetup.classList.add('step2');
            boxMeasure.classList.add('step2');
        } else if (step === 3) {
            titleSummary.classList.remove('hidden');
            boxHypo.classList.add('step3');
            boxSetup.classList.add('step3');
            boxMeasure.classList.add('step3');
        }
    }

    function updateAnimState4() {
        const step = slideSteps[4];
        const rows = document.querySelectorAll('.result-row');
        rows.forEach((row, index) => {
            if (index < step) {
                row.classList.add('visible');
            } else {
                row.classList.remove('visible');
            }
        });
        
        if (window.resultChart) {
            updateChartStep(step);
        }
    }

    function startAutoAnimation4() {
        stopAutoAnimation4();
        slideSteps[4] = 0;
        updateAnimState4();    
        autoAnimInterval = setInterval(() => {
            if (slideSteps[4] < 8) {
                slideSteps[4]++;
                updateAnimState4();
            } else {
                stopAutoAnimation4();
            }
        }, 700); 
    }
    // 이제 자러갈꺼    

    function stopAutoAnimation4() {
        if (autoAnimInterval) {
            clearInterval(autoAnimInterval);
            autoAnimInterval = null;
        }
    }

    function showFinalResults() {
        slideSteps[4] = 8;
        document.querySelectorAll('.result-row').forEach((row) => {
            row.classList.add('visible');
        });

        if (!window.resultChart) return;

        window.resultChart.data.datasets.forEach((dataset, i) => {
            dataset.data = chartFullData[i].slice();
            dataset.showLine = true;
        });
        window.resultChart.update('none');
    }

    function nextSlide() {
        if (maxSteps[currentSlide] !== undefined) {
            if (slideSteps[currentSlide] < maxSteps[currentSlide]) {
                slideSteps[currentSlide]++;
                if (currentSlide === 1) {
                    updateAnimState1();
                }
                if (currentSlide === 2) {
                    updateAnimState2();
                }
                if (currentSlide === 3) {
                    updateAnimState3();
                }
                restartActiveAnimation();
                updateIndicator();
                return;
            }
        }
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
            if (maxSteps[currentSlide] !== undefined) slideSteps[currentSlide] = 0;
            updateSlides();
        }
    }

    function restartActiveAnimation() {
        const activeSlide = slides[currentSlide];
        if (!activeSlide) return;

        activeSlide.classList.remove('animating-in');
        void activeSlide.offsetWidth;
        activeSlide.classList.add('animating-in');
    }

    function prevSlide() {
        if (maxSteps[currentSlide] !== undefined) {
            if (slideSteps[currentSlide] > 0) {
                slideSteps[currentSlide]--;
                if (currentSlide === 1) {
                    updateAnimState1();
                }
                if (currentSlide === 2) {
                    updateAnimState2();
                }
                if (currentSlide === 3) {
                    updateAnimState3();
                }
                updateIndicator();
                return;
            }
        }
        if (currentSlide > 0) {
            currentSlide--;
            if (maxSteps[currentSlide] !== undefined) slideSteps[currentSlide] = maxSteps[currentSlide];
            updateSlides();
        }
    }

    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'Space' || e.key === 'Enter') {
            nextSlide();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            prevSlide();
        }
    });

    // === 3Dmol.js ===
    async function init3Dmol() {
        initTio2Viewer();
        initRadicalViewer();
        await initMethyleneBlueViewer();
    }

    function initTio2Viewer() {
        const viewerContainer = document.getElementById('tio2-viewer');
        if (!viewerContainer || !window.$3Dmol) return;

        const viewer = $3Dmol.createViewer(viewerContainer, {
            backgroundColor: 'white',
            defaultcolors: $3Dmol.rasmolElementColors
        });

        const tio2Cluster = `7
TiO2 crystal motif
Ti 0.000 0.000 0.000
Ti 2.150 2.150 0.000
O 1.075 0.000 0.000
O -1.075 0.000 0.000
O 0.000 1.075 0.000
O 0.000 -1.075 0.000
O 2.150 1.075 0.000`;

        viewer.addModel(tio2Cluster, 'xyz');
        viewer.setStyle({}, { stick: { radius: 0.14, color: '#9ca3af' } });
        viewer.setStyle({ elem: 'Ti' }, { sphere: { scale: 0.48, color: '#facc15' }, stick: { radius: 0.14, color: '#9ca3af' } });
        viewer.setStyle({ elem: 'O' }, { sphere: { scale: 0.34, color: '#38bdf8' }, stick: { radius: 0.14, color: '#9ca3af' } });
        viewer.zoomTo();
        viewer.rotate(18, 'y');
        viewer.rotate(12, 'x');
        viewer.render();
    }

    function initRadicalViewer() {
        const viewerContainer = document.getElementById('radical-viewer');
        if (!viewerContainer || !window.$3Dmol) return;

        const viewer = $3Dmol.createViewer(viewerContainer, {
            backgroundColor: 'white',
            defaultcolors: $3Dmol.rasmolElementColors
        }); // 왜?왜?왜?

        const radical = `2
hydroxyl radical
O 0.000 0.000 0.000
H 0.960 0.000 0.000`;

        viewer.addModel(radical, 'xyz');
        viewer.setStyle({}, { stick: { radius: 0.16, color: '#9ca3af' } });
        viewer.setStyle({ elem: 'O' }, { sphere: { scale: 0.55, color: '#ef4444' }, stick: { radius: 0.16, color: '#9ca3af' } });
        viewer.setStyle({ elem: 'H' }, { sphere: { scale: 0.34, color: '#f8fafc' }, stick: { radius: 0.16, color: '#9ca3af' } });
        viewer.addLabel('·OH', {
            position: { x: 0.44, y: 0.62, z: 0 },
            fontColor: '#111111',
            backgroundColor: '#facc15',
            fontSize: 18,
            padding: 4
        });
        viewer.zoomTo();
        viewer.render();
    }

    async function initMethyleneBlueViewer() {
        const viewerContainer = document.getElementById('mol-viewer');
        if (!viewerContainer || !window.$3Dmol) return;

        const viewer = $3Dmol.createViewer(viewerContainer, {
            backgroundColor: 'white',
            defaultcolors: $3Dmol.rasmolElementColors
        });

        try {
            const response = await fetch('mb.sdf');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.text();
            
            viewer.addModel(data, "sdf");
            viewer.setStyle({}, {stick:{radius:0.15}, sphere:{scale:0.3}});
            viewer.setStyle({elem: 'C'}, {stick:{radius:0.15, color:'#555555'}, sphere:{scale:0.3, color:'#555555'}});
            viewer.zoomTo();
            viewer.rotate(12, 'y');
            viewer.rotate(8, 'x');
            viewer.render();
        } catch (error) {
            console.error('Failed to load molecule:', error);
            viewerContainer.innerHTML = '<p style="color:red; text-align:center; padding-top:40%;">분자 구조를 불러오는 데 실패했습니다.</p>';
        }
    }

    const theFuckingmol = True

    // === Chart.js ===
    const chartFullData = [
        [100, 86, 73, 61, 51, 43, 36], // A
        [100, 98, 96, 94, 92, 90, 88], // B
        [100, 94, 91, 90, 89, 88, 88], // C
        [100, 100, 99, 99, 98, 98, 98] // D
    ];

    function initChart() {
        const ctx = document.getElementById('resultChart').getContext('2d');
        const isSmallScreen = window.innerWidth <= 520;
        
        Chart.defaults.color = '#f8f9fa';
        Chart.defaults.font.family = '"Pretendard", sans-serif';

        window.resultChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['0분', '10분', '20분', '30분', '40분', '50분', '60분'],
                datasets: [
                    {
                        label: 'A: 메틸렌블루 + TiO₂ + 빛',
                        data: [],
                        borderColor: '#facc15',
                        backgroundColor: '#facc15',
                        borderWidth: 4,
                        tension: 0.3,
                        pointRadius: 6
                    },
                    {
                        label: 'B: 메틸렌블루 + 빛',
                        data: [],
                        borderColor: '#38bdf8',
                        backgroundColor: '#38bdf8',
                        borderWidth: 3,
                        borderDash: [5, 5],
                        tension: 0.3,
                        pointRadius: 4
                    },
                    {
                        label: 'C: 메틸렌블루 + TiO₂ + 어두움',
                        data: [],
                        borderColor: '#34d399',
                        backgroundColor: '#34d399',
                        borderWidth: 3,
                        borderDash: [5, 5],
                        tension: 0.3,
                        pointRadius: 4
                    },
                    {
                        label: 'D: 메틸렌블루만',
                        data: [],
                        borderColor: '#888888',
                        backgroundColor: '#888888',
                        borderWidth: 2,
                        tension: 0.3,
                        pointRadius: 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 400 
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: isSmallScreen ? 28 : 40,
                            padding: isSmallScreen ? 10 : 20,
                            font: { size: isSmallScreen ? 11 : 14 }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(30, 30, 30, 0.9)',
                        titleFont: { size: 16 },
                        bodyFont: { size: 14 },
                        padding: 15,
                        borderColor: '#333333',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 30,
                        max: 100,
                        title: { display: true, text: '농도 (%)', font: { size: isSmallScreen ? 13 : 16, weight: 'bold' } },
                        ticks: { font: { size: isSmallScreen ? 10 : 12 } },
                        grid: { color: '#333333' }
                    },
                    x: {
                        ticks: { font: { size: isSmallScreen ? 10 : 12 } },
                        grid: { display: false }
                    }
                },
                interaction: { mode: 'nearest', axis: 'x', intersect: false }
            }
        });
        
        
        updateChartStep(slideSteps[4]);
    }

    function updateChartStep(step) {
        if (!window.resultChart) return;
        
        window.resultChart.data.datasets.forEach((dataset, i) => {
            if (step <= 7) {
                dataset.data = chartFullData[i].slice(0, step);
                dataset.showLine = false;
            } else {
                dataset.data = chartFullData[i].slice(0, 7);
                dataset.showLine = true;
            }
        });
        window.resultChart.update();
    }

    updateSlides(); 
});
