import puppeteer from "puppeteer";
import xl from "excel4node";

const url = "https://www.naukri.com/it-jobs?src=gnbjobs_homepage_srch";
const workbook = new xl.Workbook();
const worksheet = workbook.addWorksheet("Job Vacancies");

/*
 * Job Title
 * Company Name
 * Location
 * Job Type (Full-time, Part-time, Contract, etc.)
 * Posted Date
 * Job Description
 */

async function scrape() {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });
    const data = await page.evaluate(() => {
      const jobTitles = Array.from(document.querySelectorAll(".title")).map(
        (e) => e.textContent.trim() || "Not Mentioned"
      );
      const companies = Array.from(document.querySelectorAll(".comp-name")).map(
        (e) => e.textContent.trim() || "Not Mentioned"
      );
      const locations = Array.from(document.querySelectorAll(".locWdth")).map(
        (e) => e.textContent.trim() || "Not Specified"
      );
      const jobTypes = Array.from(
        document.querySelectorAll(".styles_details__Y424J")
      ).map((e) => e.textContent.trim() || "Ask  Employer");
      const postedDates = Array.from(
        document.querySelectorAll(".job-post-day ")
      ).map((e) => e.textContent.trim() || "Not Mentioned");
      const descriptions = Array.from(
        document.querySelectorAll(".job-desc")
      ).map((e) => e.textContent.trim() || "Ask Employer");

      return {
        jobTitles,
        companies,
        locations,
        jobTypes,
        postedDates,
        descriptions,
      };
    });
    await browser.close();
    worksheet.cell(1, 1).string("Job Title");
    worksheet.cell(1, 2).string("Company Name");
    worksheet.cell(1, 3).string("Location/s");
    worksheet.cell(1, 4).string("Job Type");
    worksheet.cell(1, 5).string("Posted Date");
    worksheet.cell(1, 6).string("Job Description");

    data.jobTitles.forEach((title, index) => {
      worksheet.cell(index + 2, 1).string(title);
      worksheet.cell(index + 2, 2).string(data.companies[index]);
      worksheet.cell(index + 2, 3).string(data.locations[index]);
      worksheet.cell(index + 2, 4).string(data.jobTypes[index]);
      worksheet.cell(index + 2, 5).string(data.postedDates[index]);
      worksheet.cell(index + 2, 6).string(data.descriptions[index]);
    });

    workbook.write("job_vacancies.xlsx");
    console.log("Data successfully scraped and saved to Excel");
  } catch (err) {
    console.log(err);
  }
}
scrape();
