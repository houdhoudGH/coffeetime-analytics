

let chartJsInstance = null;
let d3ChartData = null;
let autoRefreshInterval = null;
let currentFilters = {
    startDate: '2024-03-01',
    endDate: '2024-12-31',
    coffeeType: 'all',
    groupBy: 'monthly'
};

const colorPalette = [
    '#8B4513', '#D4A574', '#A0522D', '#5D2E0C', '#E8C9A4',
    '#CD853F', '#DEB887', '#BC8F8F', '#F4A460', '#8B7355'
];

document.addEventListener('DOMContentLoaded', function() {
    console.log('☕ CoffeeTime Analytics Initialized');
    
    initThemeToggle();
    initCollapsibleSections();
    initFilterForm();
    initAutoRefresh();
    loadCoffeeTypes();
    loadInitialData();
    initArticleFilters();
});

function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.querySelector('.theme-icon');
    
    if (!themeToggle) return;

    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme, themeIcon);

    const savedColorTheme = localStorage.getItem('colorTheme') || 'coffee';
    document.documentElement.setAttribute('data-color-theme', savedColorTheme);
    updateColorButtonsState(savedColorTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme, themeIcon);

        if (chartJsInstance) {
            updateChartColors();
        }
    });

    initColorThemeButtons();
}

function updateThemeIcon(theme, iconElement) {
    if (iconElement) {
        iconElement.innerHTML = theme === 'light' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
    }
}

function initColorThemeButtons() {
    const colorButtons = document.querySelectorAll('.nav-color-btn');
    
    if (colorButtons.length === 0) return;
    
    colorButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const theme = button.getAttribute('data-theme');

            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            ripple.style.width = ripple.style.height = '15px';
            ripple.style.left = '5px';
            ripple.style.top = '5px';
            button.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);

            if (theme === 'coffee') {
                document.documentElement.removeAttribute('data-color-theme');
            } else {
                document.documentElement.setAttribute('data-color-theme', theme);
            }

            localStorage.setItem('colorTheme', theme);

            updateColorButtonsState(theme);

            if (chartJsInstance && typeof loadFilteredData === 'function') {
                setTimeout(() => loadFilteredData(), 300);
            }
            
            console.log(`🎨 Theme changed to: ${theme}`);
        });
    });
}

function updateColorButtonsState(activeTheme) {
    const colorButtons = document.querySelectorAll('.nav-color-btn');
    colorButtons.forEach(btn => {
        if (btn.getAttribute('data-theme') === activeTheme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function createRipple(event, button) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';
    
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

function celebrateThemeChange() {

    const container = document.querySelector('.hero') || document.body;
    const colors = ['#E91E63', '#1976D2', '#2E7D32', '#8B4513', '#FFD700', '#9C27B0'];
    
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'theme-particle';
            particle.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                left: ${Math.random() * 100}vw;
                top: -20px;
                animation: particleFall ${1 + Math.random() * 2}s ease-out forwards;
            `;
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 3000);
        }, i * 50);
    }
}

if (!document.getElementById('particle-styles')) {
    const style = document.createElement('style');
    style.id = 'particle-styles';
    style.textContent = `
        @keyframes particleFall {
            0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg) scale(0); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

function updateChartColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#FAF7F2' : '#2C1810';
    const gridColor = isDark ? 'rgba(250, 247, 242, 0.1)' : 'rgba(44, 24, 16, 0.1)';
    
    if (chartJsInstance) {
        chartJsInstance.options.scales.x.ticks.color = textColor;
        chartJsInstance.options.scales.y.ticks.color = textColor;
        chartJsInstance.options.scales.x.grid.color = gridColor;
        chartJsInstance.options.scales.y.grid.color = gridColor;
        chartJsInstance.options.plugins.legend.labels.color = textColor;
        chartJsInstance.update();
    }
}

function initCollapsibleSections() {

    const insightsHeader = document.getElementById('insights-header');
    const insightsContent = document.getElementById('insights-content');
    
    if (insightsHeader && insightsContent) {
        insightsHeader.addEventListener('click', () => {
            toggleSection(insightsContent, insightsHeader.querySelector('.toggle-arrow'));
        });
    }

    const datasetHeader = document.getElementById('dataset-header');
    const datasetContent = document.getElementById('dataset-content');
    
    if (datasetHeader && datasetContent) {
        datasetHeader.addEventListener('click', () => {
            toggleSection(datasetContent, datasetHeader.querySelector('.toggle-arrow'));
        });
    }

    const toggleCharts = document.getElementById('toggle-charts');
    const chartsContainer = document.getElementById('charts-container');
    
    if (toggleCharts && chartsContainer) {
        toggleCharts.addEventListener('click', () => {
            const isHidden = chartsContainer.classList.toggle('hidden');
            toggleCharts.innerHTML = isHidden 
                ? '<span class="toggle-icon"><i class="fa-solid fa-eye"></i></span> Show Charts'
                : '<span class="toggle-icon"><i class="fa-solid fa-eye-slash"></i></span> Hide Charts';
        });
    }
}

function toggleSection(content, arrow) {
    content.classList.toggle('collapsed');
    if (arrow) {
        arrow.classList.toggle('collapsed');
    }
}

function initFilterForm() {
    const form = document.getElementById('data-filter-form');
    const resetBtn = document.getElementById('reset-filters');
    const errorsDiv = document.getElementById('form-errors');
    
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (errorsDiv) errorsDiv.textContent = '';

        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const coffeeType = document.getElementById('coffee-type').value;
        const groupBy = document.getElementById('group-by').value;

        const errors = validateFilters(startDate, endDate);
        
        if (errors.length > 0) {
            if (errorsDiv) errorsDiv.textContent = errors.join(' ');
            return;
        }

        currentFilters = { startDate, endDate, coffeeType, groupBy };

        await loadFilteredData();
    });
    
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            document.getElementById('start-date').value = '2024-03-01';
            document.getElementById('end-date').value = '2024-12-31';
            document.getElementById('coffee-type').value = 'all';
            document.getElementById('group-by').value = 'monthly';
            
            currentFilters = {
                startDate: '2024-03-01',
                endDate: '2024-12-31',
                coffeeType: 'all',
                groupBy: 'monthly'
            };
            
            if (errorsDiv) errorsDiv.textContent = '';
            loadFilteredData();
        });
    }

    const refreshBtn = document.getElementById('refresh-data');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadFilteredData();
        });
    }

    const exportBtn = document.getElementById('export-png');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportChartToPNG);
    }
}

function validateFilters(startDate, endDate) {
    const errors = [];
    
    if (!startDate) {
        errors.push('Start date is required.');
    }
    
    if (!endDate) {
        errors.push('End date is required.');
    }
    
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        errors.push('Start date must be before end date.');
    }
    
    const minDate = new Date('2024-01-01');
    const maxDate = new Date('2024-12-31');
    
    if (startDate && (new Date(startDate) < minDate || new Date(startDate) > maxDate)) {
        errors.push('Start date must be in 2024.');
    }
    
    if (endDate && (new Date(endDate) < minDate || new Date(endDate) > maxDate)) {
        errors.push('End date must be in 2024.');
    }
    
    return errors;
}

async function loadCoffeeTypes() {
    try {
        const response = await fetch('/data/types');
        const data = await response.json();
        
        const select = document.getElementById('coffee-type');
        if (select && data.types) {
            data.types.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading coffee types:', error);
    }
}

async function loadInitialData() {
    await loadFilteredData();
    loadSampleData();
}

async function loadFilteredData() {
    try {
        const params = new URLSearchParams({
            group_by: currentFilters.groupBy,
            coffee_type: currentFilters.coffeeType,
            start_date: currentFilters.startDate,
            end_date: currentFilters.endDate
        });
        
        const response = await fetch(`/data?${params}`);
        const data = await response.json();

        updateStats(data.summary);

        updateChartJS(data);

        updateD3Chart(data);
        
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function updateStats(summary) {
    const revenueEl = document.getElementById('total-revenue');
    const transactionsEl = document.getElementById('total-transactions');
    const daysEl = document.getElementById('unique-days');

    if (revenueEl) {
        const targetRevenue = summary.total_revenue / 1000;
        animateCountUp(revenueEl, 0, targetRevenue, 2000, (value) => `$${value.toFixed(1)}k`);
    }

    if (transactionsEl) {
        animateCountUp(transactionsEl, 0, summary.total_transactions, 2000, (value) => Math.round(value).toLocaleString());
    }

    if (daysEl) {
        animateCountUp(daysEl, 0, summary.unique_dates, 1500, (value) => Math.round(value).toString());
    }
}

function animateCountUp(element, start, end, duration, formatter) {
    const startTime = performance.now();

    element.classList.add('counting');
    
    function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuart(progress);
        const currentValue = start + (end - start) * easedProgress;
        
        element.textContent = formatter(currentValue);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {

            element.classList.remove('counting');
            element.classList.add('count-complete');
            setTimeout(() => element.classList.remove('count-complete'), 300);
        }
    }
    
    requestAnimationFrame(update);
}

function loadSampleData() {
    const tableBody = document.getElementById('sample-data-table');
    if (!tableBody) return;

    const sampleData = [
        { date: '2024-03-01', time: '10:15', type: 'card', amount: 38.7, coffee: 'Latte' },
        { date: '2024-03-01', time: '12:19', type: 'card', amount: 38.7, coffee: 'Hot Chocolate' },
        { date: '2024-03-01', time: '13:46', type: 'card', amount: 28.9, coffee: 'Americano' },
        { date: '2024-03-02', time: '10:22', type: 'card', amount: 28.9, coffee: 'Americano' },
        { date: '2024-03-02', time: '10:30', type: 'cash', amount: 40.0, coffee: 'Latte' },
        { date: '2024-03-03', time: '10:10', type: 'cash', amount: 40.0, coffee: 'Latte' },
        { date: '2024-03-03', time: '11:33', type: 'card', amount: 28.9, coffee: 'Cortado' },
        { date: '2024-03-04', time: '10:03', type: 'card', amount: 38.7, coffee: 'Latte' }
    ];
    
    tableBody.innerHTML = sampleData.map(row => `
        <tr>
            <td>${row.date}</td>
            <td>${row.time}</td>
            <td><span class="badge badge-${row.type}">${row.type}</span></td>
            <td>$${row.amount.toFixed(2)}</td>
            <td>${row.coffee}</td>
        </tr>
    `).join('');

    const loadMoreBtn = document.getElementById('load-more-data');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            const moreData = [
                { date: '2024-03-05', time: '09:59', type: 'card', amount: 38.7, coffee: 'Latte' },
                { date: '2024-03-05', time: '14:34', type: 'card', amount: 38.7, coffee: 'Latte' },
                { date: '2024-03-06', time: '12:30', type: 'cash', amount: 35.0, coffee: 'Americano with Milk' },
                { date: '2024-03-07', time: '10:08', type: 'cash', amount: 40.0, coffee: 'Latte' }
            ];
            
            moreData.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.date}</td>
                    <td>${row.time}</td>
                    <td><span class="badge badge-${row.type}">${row.type}</span></td>
                    <td>$${row.amount.toFixed(2)}</td>
                    <td>${row.coffee}</td>
                `;
                tr.style.animation = 'fadeIn 0.5s ease';
                tableBody.appendChild(tr);
            });
        });
    }
}

function updateChartJS(data) {
    const canvas = document.getElementById('chartjs-line-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#FAF7F2' : '#2C1810';
    const gridColor = isDark ? 'rgba(250, 247, 242, 0.1)' : 'rgba(44, 24, 16, 0.1)';

    const datasets = [
        {
            label: 'Total Sales ($)',
            data: data.datasets.total_sales,
            borderColor: colorPalette[0],
            backgroundColor: `${colorPalette[0]}20`,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 8
        },
        {
            label: 'Transaction Count',
            data: data.datasets.transaction_count,
            borderColor: colorPalette[1],
            backgroundColor: `${colorPalette[1]}20`,
            fill: false,
            tension: 0.4,
            yAxisID: 'y1',
            pointRadius: 4,
            pointHoverRadius: 8
        }
    ];

    if (chartJsInstance) {
        chartJsInstance.destroy();
    }

    chartJsInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: textColor,
                        font: {
                            family: 'Inter',
                            size: 12
                        },
                        usePointStyle: true,
                        padding: 20
                    },
                    onClick: function(e, legendItem, legend) {
                        const index = legendItem.datasetIndex;
                        const ci = legend.chart;
                        const meta = ci.getDatasetMeta(index);
                        
                        meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
                        ci.update();
                    }
                },
                tooltip: {
                    backgroundColor: isDark ? 'rgba(44, 24, 16, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: colorPalette[0],
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.datasetIndex === 0) {
                                label += '$' + context.parsed.y.toFixed(2);
                            } else {
                                label += context.parsed.y + ' transactions';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            family: 'Inter'
                        }
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            family: 'Inter'
                        },
                        callback: function(value) {
                            return '$' + value;
                        }
                    },
                    title: {
                        display: true,
                        text: 'Sales ($)',
                        color: textColor
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            family: 'Inter'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Transactions',
                        color: textColor
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

let selectedCoffeeType = null;

function updateD3Chart(data) {
    const container = document.getElementById('d3-bar-chart');
    if (!container) return;
    
    d3.select(container).selectAll('*').remove();
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#FAF7F2' : '#2C1810';
    
    const chartData = Object.keys(data.by_type).map((type, i) => ({
        type: type,
        total: data.by_type[type].reduce((sum, val) => sum + val, 0),
        color: colorPalette[i % colorPalette.length]
    })).sort((a, b) => b.total - a.total);
    
    d3ChartData = chartData;
    
    const margin = { top: 40, right: 30, bottom: 80, left: 70 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 320 - margin.top - margin.bottom;
    
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', -15)
        .attr('text-anchor', 'middle')
        .style('fill', selectedCoffeeType ? 'var(--primary-color)' : textColor)
        .style('font-size', '12px')
        .style('font-family', 'Inter')
        .style('font-weight', selectedCoffeeType ? '600' : '400')
        .text(selectedCoffeeType ? `🔍 Filtered: ${selectedCoffeeType} (click again to show all)` : '💡 Click a bar to filter by coffee type');

    if (selectedCoffeeType) {
        const resetBtn = svg.append('g')
            .attr('class', 'reset-btn')
            .attr('transform', `translate(${width - 40}, -20)`)
            .style('cursor', 'pointer')
            .on('click', function() {
                selectedCoffeeType = null;
                const select = document.getElementById('coffee-type');
                if (select) {
                    select.value = 'all';
                    currentFilters.coffeeType = 'all';
                }
                loadFilteredData();
            });
        
        resetBtn.append('rect')
            .attr('x', -25)
            .attr('y', -10)
            .attr('width', 70)
            .attr('height', 22)
            .attr('rx', 11)
            .attr('fill', '#c0392b');
        
        resetBtn.append('text')
            .attr('x', 10)
            .attr('y', 5)
            .attr('text-anchor', 'middle')
            .attr('fill', 'white')
            .style('font-size', '11px')
            .style('font-family', 'Inter')
            .style('font-weight', '600')
            .text('✕ Reset');
    }
    
    const x = d3.scaleBand()
        .range([0, width])
        .domain(chartData.map(d => d.type))
        .padding(0.3);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d.total) * 1.1])
        .range([height, 0]);
    
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('text-anchor', 'end')
        .style('fill', textColor)
        .style('font-family', 'Inter')
        .style('font-size', '11px')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)');
    
    svg.append('g')
        .call(d3.axisLeft(y).tickFormat(d => '$' + d))
        .selectAll('text')
        .style('fill', textColor)
        .style('font-family', 'Inter');
    
    const tooltip = d3.select('#d3-tooltip');
    
    function getBarOpacity(d) {
        if (!selectedCoffeeType) return 1;
        return d.type === selectedCoffeeType ? 1 : 0.3;
    }
    
    svg.selectAll('.bar')
        .data(chartData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.type))
        .attr('width', x.bandwidth())
        .attr('y', height)
        .attr('height', 0)
        .attr('fill', d => d.color)
        .attr('opacity', d => getBarOpacity(d))
        .attr('stroke', d => d.type === selectedCoffeeType ? '#FFD700' : 'transparent')
        .attr('stroke-width', 3)
        .attr('rx', 4)
        .attr('ry', 4)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('fill', d3.rgb(d.color).brighter(0.4))
                .attr('opacity', 1);
            
            const totalAll = chartData.reduce((sum, item) => sum + item.total, 0);
            const percentage = ((d.total / totalAll) * 100).toFixed(1);
            
            tooltip
                .style('opacity', 1)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 10) + 'px')
                .html(`
                    <strong style="font-size: 14px;">${d.type}</strong><br/>
                    <span style="color: var(--primary-color);">$${d.total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span><br/>
                    <span style="color: var(--text-muted);">${percentage}% of total</span>
                `);
            tooltip.classed('visible', true);
        })
        .on('mousemove', function(event) {
            tooltip
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseout', function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('fill', d.color)
                .attr('opacity', getBarOpacity(d));
            
            tooltip.classed('visible', false);
        })
        .on('click', function(event, d) {
            if (selectedCoffeeType === d.type) {
                selectedCoffeeType = null;
                const select = document.getElementById('coffee-type');
                if (select) {
                    select.value = 'all';
                    currentFilters.coffeeType = 'all';
                }
            } else {
                selectedCoffeeType = d.type;
                const select = document.getElementById('coffee-type');
                if (select) {
                    select.value = d.type;
                    currentFilters.coffeeType = d.type;
                }
            }
            loadFilteredData();
        })
        .transition()
        .duration(800)
        .delay((d, i) => i * 100)
        .attr('y', d => y(d.total))
        .attr('height', d => height - y(d.total));
    
    svg.selectAll('.label')
        .data(chartData)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => x(d.type) + x.bandwidth() / 2)
        .attr('y', d => y(d.total) - 8)
        .attr('text-anchor', 'middle')
        .style('fill', textColor)
        .style('font-size', '11px')
        .style('font-weight', d => d.type === selectedCoffeeType ? '700' : '500')
        .style('font-family', 'Inter')
        .style('opacity', 0)
        .text(d => '$' + (d.total / 1000).toFixed(1) + 'k')
        .transition()
        .duration(800)
        .delay((d, i) => i * 100 + 400)
        .style('opacity', d => getBarOpacity(d));
}

function exportChartToPNG() {
    const canvas = document.getElementById('chartjs-line-chart');
    if (!canvas) {
        alert('No chart to export. Please wait for the chart to load.');
        return;
    }

    if (!chartJsInstance) {
        alert('Chart is still loading. Please try again in a moment.');
        return;
    }
    
    try {

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        tempCtx.fillStyle = isDark ? '#1A1410' : '#FFFFFF';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        tempCtx.drawImage(canvas, 0, 0);

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const filename = `coffee-sales-chart-${timestamp}.png`;

        tempCanvas.toBlob(function(blob) {
            if (!blob) {

                const link = document.createElement('a');
                link.download = filename;
                link.href = canvas.toDataURL('image/png', 1.0);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                return;
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = filename;
            link.href = url;

            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);
            
            console.log('Chart exported successfully:', filename);
        }, 'image/png', 1.0);
        
    } catch (error) {
        console.error('Error exporting chart:', error);

        try {
            const link = document.createElement('a');
            link.download = `coffee-sales-chart-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (fallbackError) {
            alert('Unable to export chart. Please try using your browser\'s screenshot feature.');
        }
    }
}

function initDynamicElements() {
    const changeColorBtn = document.getElementById('change-color');
    const addElementBtn = document.getElementById('add-element');
    const dynamicContainer = document.getElementById('dynamic-elements');
    
    if (changeColorBtn) {
        changeColorBtn.addEventListener('click', () => {

            const hue = Math.floor(Math.random() * 40) + 15; // Brown range
            const saturation = Math.floor(Math.random() * 30) + 40;
            const lightness = Math.floor(Math.random() * 20) + 30;
            
            const newColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            document.documentElement.style.setProperty('--primary-color', newColor);

            changeColorBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                changeColorBtn.style.transform = 'scale(1)';
            }, 150);
        });
    }
    
    if (addElementBtn && dynamicContainer) {
        let counter = 0;
        const randomStats = [
            { label: 'Peak Hour Sales', value: () => '$' + (Math.random() * 500 + 200).toFixed(0) },
            { label: 'Avg Transaction', value: () => '$' + (Math.random() * 20 + 25).toFixed(2) },
            { label: 'Best Seller', value: () => ['Latte', 'Cappuccino', 'Americano'][Math.floor(Math.random() * 3)] },
            { label: 'Today\'s Target', value: () => (Math.random() * 100).toFixed(0) + '%' },
            { label: 'New Customers', value: () => Math.floor(Math.random() * 50 + 10) }
        ];
        
        addElementBtn.addEventListener('click', () => {
            const stat = randomStats[counter % randomStats.length];
            counter++;
            
            const element = document.createElement('div');
            element.className = 'dynamic-stat';
            element.innerHTML = `
                <strong>${stat.value()}</strong>
                <span style="display: block; font-size: 0.85rem; color: var(--text-muted);">${stat.label}</span>
            `;
            
            dynamicContainer.appendChild(element);

            if (dynamicContainer.children.length > 5) {
                dynamicContainer.removeChild(dynamicContainer.firstChild);
            }
        });
    }
}

function initAutoRefresh() {
    const toggle = document.getElementById('auto-refresh-toggle');
    const statusText = document.getElementById('refresh-status');
    
    if (!toggle) return;
    
    toggle.addEventListener('change', () => {
        if (toggle.checked) {
            statusText.textContent = 'On';
            startAutoRefresh();
        } else {
            statusText.textContent = 'Off';
            stopAutoRefresh();
        }
    });
}

function startAutoRefresh() {
    autoRefreshInterval = setInterval(() => {
        console.log('Auto-refreshing data...');
        loadFilteredData();

        const refreshBtn = document.getElementById('refresh-data');
        if (refreshBtn) {
            refreshBtn.classList.add('animate-pulse');
            setTimeout(() => refreshBtn.classList.remove('animate-pulse'), 1000);
        }
    }, 30000); // Every 30 seconds
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
}

function initArticleFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const articles = document.querySelectorAll('article');
    
    if (filterButtons.length === 0) return;
    
    function filterArticles(category) {
        let visibleCount = 0;

        articles.forEach((article, index) => {
            const articleCategory = article.getAttribute('data-category');
            
            if (category === 'all' || articleCategory === category) {
                setTimeout(() => {
                    article.style.display = 'block';
                    article.style.opacity = '0';
                    article.style.transform = 'translateY(20px)';
                    
                    article.offsetHeight;
                    
                    article.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    article.style.opacity = '1';
                    article.style.transform = 'translateY(0)';
                }, index * 50);
                
                visibleCount++;
            } else {
                article.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                article.style.opacity = '0';
                article.style.transform = 'translateY(-10px)';
                
                setTimeout(() => {
                    article.style.display = 'none';
                }, 300);
            }
        });

        return visibleCount;
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const category = button.getAttribute('data-filter');
            const count = filterArticles(category);
            console.log(`Showing ${count} ${category === 'all' ? 'total' : category} items`);
        });
    });

    filterArticles('all');
}

window.addEventListener('resize', debounce(() => {
    if (d3ChartData) {

        fetch(`/data?group_by=${currentFilters.groupBy}&coffee_type=${currentFilters.coffeeType}&start_date=${currentFilters.startDate}&end_date=${currentFilters.endDate}`)
            .then(response => response.json())
            .then(data => updateD3Chart(data))
            .catch(err => console.error('Error resizing D3 chart:', err));
    }
}, 250));

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

console.log(`
☕ Welcome to CoffeeTime Analytics!
   
   Features:
   - Interactive Chart.js line chart
   - D3.js bar chart with animations
   - Dark/Light mode toggle
   - Form validation
   - Real-time data refresh
   - Collapsible sections
   
   Happy analyzing!
`);
