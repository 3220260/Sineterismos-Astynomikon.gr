/* =========================================
   Site version notice
========================================= */
(function () {
    function formatGreekDateTime(value) {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '';
        }

        return new Intl.DateTimeFormat('el-GR', {
            timeZone: 'Europe/Athens',
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(date);
    }

    async function loadSiteUpdateNotice() {
        const target = document.getElementById('siteLastUpdated');

        if (!target) return;

        try {
            const response = await fetch(`assets/site-version.json?v=${Date.now()}`, {
                cache: 'no-store',
            });

            if (!response.ok) throw new Error('site-version not available');

            const data = await response.json();
            const formatted = formatGreekDateTime(data.updatedAt);

            if (!formatted) throw new Error('invalid updatedAt');

            target.textContent = `Τελευταία ενημέρωση: ${formatted}`;
            target.setAttribute('title', data.commit ? `Commit: ${data.commit}` : '');
        } catch (error) {
            target.textContent = 'Τελευταία ενημέρωση: διαθέσιμη σύντομα.';
        }
    }

    window.loadSiteUpdateNotice = loadSiteUpdateNotice;
})();
