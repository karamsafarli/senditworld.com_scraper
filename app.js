const puppeteer = require('puppeteer');
const countries = require('./country');
const scrapeData = require('./scrape');
const ExcelJS = require('exceljs');
const weights = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 35, 40, 45, 50];

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('https://app.senditworld.com/login');
    await page.type('input[type="email"]', 'random@gmail.com');
    await page.type('input[type="password"]', 'random_password');
    await page.keyboard.press('Enter');  
    await page.waitForNavigation();

    const cookies = await page.cookies(); 

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Scraped Data');

    worksheet.addRow([
        'From',
        'To',
        'Dimension',
        'Weight (Kg)',
        'Val',
        'Company',
        'Type',
        'Type Description',
        'Price'
    ]);

    for (const country of countries) {
        for (const weight of weights) {
            try {
                const newPage = await browser.newPage();
                await newPage.setCookie(...cookies);
                await newPage.goto('https://app.senditworld.com/quote?quote=quote&sType=international&from=AE&to=' + country.code + '&type=small-box&weight=' + weight + '&value=1&length=1&width=1&height=1');

                const data = await scrapeData(newPage);

                if (!data) {
                    console.log('No useful data found for ' + country.code);
                    continue;
                }


                data.map((d) => {
                    worksheet.addRow([
                        'AUE',
                        country.name,
                        '1X1X1',
                        `${weight}`,
                        '1',
                        d.name,
                        d.type,
                        d.description,
                        `AED ${d.price}`
                    ]);
                });

                console.log(`To ${country.name} with weight ${weight}`);
                await newPage.close();
            } catch (error) {
                console.error(error);
            }
        }
    }

    await workbook.xlsx.writeFile('scraped_data.xlsx');
    await browser.close();
})();
