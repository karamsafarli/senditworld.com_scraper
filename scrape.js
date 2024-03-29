const scrapeData = async (page) => {
    try {
        await page.waitForSelector('.title-wrapper .title');

        const title = await page.evaluate(() => {
            return document.querySelector('.title-wrapper .title').textContent.trim().toLowerCase();
        });

        if (title === 'contact support') {
            return null;
        }

        await page.waitForSelector('.service');

        const servicesData = await page.evaluate(() => {
            const services = document.querySelectorAll('.service');
            const data = [];

            services.forEach(service => {
                const serviceName = service.querySelector('.name').textContent.trim();
                const serviceType = service.querySelector('.note-title').textContent.trim();
                const servicePrice = service.querySelector('.price').textContent.trim();
                const [currency, price] = servicePrice.split(' ');

                const serviceDescription = service.querySelector('.inner-wrapper').innerText.trim();

                const serviceDetails = {
                    name: serviceName,
                    type: serviceType,
                    price: price,
                    currency: currency,
                    description: serviceDescription,
                };
                data.push(serviceDetails);
            });

            return data;
        });

        return servicesData;
    } catch (error) {
        return null;
    }
};

module.exports = scrapeData;
