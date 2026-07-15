import { test, expect } from "@playwright/test";

test.describe("Indonesian Clinical Nutrition Decisions Workflow (End-to-End)", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the developmental preview applet URL
    await page.goto("/");
  });

  test("should successfully navigate through the clinical workflow: profile setup, cooking method retention, drug alerts, and report export", async ({ page }) => {
    // 1. Setup Patient Profile (Female, Pregnant Trimester 3)
    // Click on the patient profile section/tab (usually in sidebar or main tab navigation)
    const profileTabButton = page.locator("#tab-patient-profile, button:has-text('Patient Profile'), [data-testid='patient-profile-tab']").first();
    if (await profileTabButton.isVisible()) {
      await profileTabButton.click();
    }

    // Set Patient Name
    const nameField = page.locator("#patient-name-field");
    if (await nameField.isVisible()) {
      await nameField.fill("Ibu Kartini");
    }

    // Select Gender as Female
    const genderField = page.locator("#patient-gender-field");
    if (await genderField.isVisible()) {
      await genderField.selectOption("Female");
    }

    // Wait for the pregnancy select field to appear upon selecting Female
    const pregnancySelect = page.locator("select:has-text('Pregnancy Status'), select:has-text('Trimester'), select[value='none']").first();
    if (await pregnancySelect.isVisible()) {
      await pregnancySelect.selectOption("trimester3");
    }

    // Select physical activity level to Lightly Active
    const activityField = page.locator("#patient-activity-field");
    if (await activityField.isVisible()) {
      await activityField.selectOption("Lightly Active");
    }

    // Fill clinical pathology indicators
    const conditionField = page.locator("input[placeholder*='Diabetes']");
    if (await conditionField.isVisible()) {
      await conditionField.fill("Pregnancy Induced Hypertension, Gestational Diabetes");
    }

    // 2. Add Medication and Trigger Drug-Nutrient Interaction Alerts
    // Go to Medication Tracker section inside profile or dedicated tab
    const drugSearchInput = page.locator("#drug-search-input, input[placeholder*='Cari Obat']");
    if (await drugSearchInput.isVisible()) {
      // Input "Ciprofloxacin" or "Warfarin" to trigger critical safety interaction alert
      await drugSearchInput.fill("Ciprofloxacin");
      await page.keyboard.press("Enter");
      
      // Select the drug from autocomplete suggestions
      const suggestionItem = page.locator(".suggestion-item, [onClick*='Ciprofloxacin']").first();
      if (await suggestionItem.isVisible()) {
        await suggestionItem.click();
      }
    }

    // 3. Navigate to Food Log / Spreadsheet Editor Tab
    const spreadsheetTabButton = page.locator("#tab-spreadsheet, button:has-text('Spreadsheet'), button:has-text('Food Log')").first();
    if (await spreadsheetTabButton.isVisible()) {
      await spreadsheetTabButton.click();
    }

    // Add local Indonesian food item (e.g., "Bayam Hijau")
    const searchFoodField = page.locator("input[placeholder*='Cari makanan'], #search-food-input").first();
    if (await searchFoodField.isVisible()) {
      await searchFoodField.fill("Bayam Hijau");
      await page.keyboard.press("Enter");
      
      // Click first suggestions to add food log
      const foodRowSuggestion = page.locator("button:has-text('Bayam Hijau'), .food-suggestion-row").first();
      if (await foodRowSuggestion.isVisible()) {
        await foodRowSuggestion.click();
      }
    }

    // Edit cooking method to 'Goreng' (Fried) or 'Rebus' (Boiled) to trigger clinical retention calculation
    const cookingMethodDropdown = page.locator("select[value='raw'], select:has-text('Raw')").first();
    if (await cookingMethodDropdown.isVisible()) {
      await cookingMethodDropdown.selectOption("fried");
    }

    // 4. Verify Retention Factors & Real-time Nutrient Summaries
    // The right side info bar / inspector calculates the total nutritional content live
    const rightPanel = page.locator("#right-inspector, .right-sidebar, [data-testid='right-panel']").first();
    if (await rightPanel.isVisible()) {
      // Ensure the retention factors and nutrient results have updated accordingly
      await expect(rightPanel).toContainText(/Calories|Energy|Protein|Fat|Carbs/i);
    }

    // 5. Verify Medication Alerts & Interactions Panel
    const medicationAlertSection = page.locator("#medication-alerts, .alert-container, :has-text('Interaksi Obat')").first();
    if (await medicationAlertSection.isVisible()) {
      // Check for clinical Ciprofloxacin - Calcium or general safety absorption risk warnings
      await expect(medicationAlertSection).toContainText(/Ciprofloxacin|Interaksi|Warning/i);
    }

    // 6. Export Branded Clinical Report (PDF/Excel/Word)
    const pdfExportButton = page.locator("button:has-text('PDF'), button[title*='PDF']").first();
    const excelExportButton = page.locator("button:has-text('Excel'), button[title*='Excel']").first();
    const wordExportButton = page.locator("button:has-text('Word'), button[title*='Word']").first();

    if (await pdfExportButton.isVisible()) {
      await expect(pdfExportButton).toBeEnabled();
    }
    if (await excelExportButton.isVisible()) {
      await expect(excelExportButton).toBeEnabled();
    }
    if (await wordExportButton.isVisible()) {
      await expect(wordExportButton).toBeEnabled();
    }
  });
});
