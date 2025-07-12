import { getTemplateById, generateCertificateContent } from "./utils/certificateTemplates.js";

// Test data
const template = getTemplateById('elegant-gold');
const certificateData = {
  participant: "John Doe",
  event: "Test Certificate",
  issueDate: "Sat Jul 12 2025",
  signature: null,
  organizationName: "Test Organization"
};

console.log("Template:", template.name);
console.log("Template ID:", template.id);

const { styles, content } = generateCertificateContent(template, certificateData);

console.log("\n=== STYLES ===");
console.log(styles.substring(0, 200) + "...");

console.log("\n=== CONTENT ===");
console.log(content.substring(0, 200) + "...");

console.log("\n✅ Template generation test completed successfully!");