// File: frontend/src/utils/translations.js

// Static translations for common UI elements
// This avoids unnecessary API calls for frequently used text
const translations = {
    // Page titles
    'Dashboard': {
      en: 'Dashboard',
      th: 'แดชบอร์ด'
    },
    'Customer View': {
      en: 'Customer View',
      th: 'มุมมองลูกค้า'
    },
    'Technician Performance': {
      en: 'Technician Performance',
      th: 'ประสิทธิภาพช่างเทคนิค'
    },
    'Map View': {
      en: 'Map View',
      th: 'มุมมองแผนที่'
    },
    'Analytics': {
      en: 'Analytics',
      th: 'การวิเคราะห์'
    },
    'Settings': {
      en: 'Settings',
      th: 'การตั้งค่า'
    },
  
    // Customer page
    'Customers': {
      en: 'Customers',
      th: 'ลูกค้า'
    },
    'Customer Analysis': {
      en: 'Customer Analysis',
      th: 'การวิเคราะห์ลูกค้า'
    },
    'Job History': {
      en: 'Job History',
      th: 'ประวัติงาน'
    },
    'Job Timeline': {
      en: 'Job Timeline',
      th: 'ไทม์ไลน์งาน'
    },
    'Select a customer to view job history': {
      en: 'Select a customer to view job history',
      th: 'เลือกลูกค้าเพื่อดูประวัติงาน'
    },
    'No job history found for this customer': {
      en: 'No job history found for this customer',
      th: 'ไม่พบประวัติงานสำหรับลูกค้ารายนี้'
    },
  
    // Job status
    'WAITINGJOB': {
      en: 'WAITING JOB',
      th: 'รองานเข้า'
    },
    'WORKING': {
      en: 'WORKING',
      th: 'กำลังทำงาน'
    },
    'COMPLETED': {
      en: 'COMPLETED',
      th: 'เสร็จแล้ว'
    },
    'CLOSED': {
      en: 'CLOSED',
      th: 'ปิดงานแล้ว'
    },
    'CANCELLED': {
      en: 'CANCELLED',
      th: 'ยกเลิกแล้ว'
    },
    'REVIEW': {
      en: 'REVIEW',
      th: 'รีวิวแล้ว'
    },
    'CREATED': {
      en: 'CREATED',
      th: 'สร้างแล้ว'
    },
  
    // Table headers
    'Job No.': {
      en: 'Job No.',
      th: 'หมายเลขงาน'
    },
    'Status': {
      en: 'Status',
      th: 'สถานะ'
    },
    'Type': {
      en: 'Type',
      th: 'ประเภท'
    },
    'Location': {
      en: 'Location',
      th: 'สถานที่'
    },
    'Created': {
      en: 'Created',
      th: 'สร้างเมื่อ'
    },
    'Closed': {
      en: 'Closed',
      th: 'ปิดเมื่อ'
    },
    'Technicians': {
      en: 'Technicians',
      th: 'ช่างเทคนิค'
    },
    'Rating': {
      en: 'Rating',
      th: 'คะแนน'
    },
  
    // Common UI elements
    'Search customers...': {
      en: 'Search customers...',
      th: 'ค้นหาลูกค้า...'
    },
    'No customers found': {
      en: 'No customers found',
      th: 'ไม่พบลูกค้า'
    },
    'Select a job to view detailed timeline': {
      en: 'Select a job to view detailed timeline',
      th: 'เลือกงานเพื่อดูไทม์ไลน์โดยละเอียด'
    },
    'No job details available': {
      en: 'No job details available',
      th: 'ไม่มีรายละเอียดงาน'
    },
    'No timeline data available': {
      en: 'No timeline data available',
      th: 'ไม่มีข้อมูลไทม์ไลน์'
    },
    
    // Job details
    'Job Number': {
      en: 'Job Number',
      th: 'หมายเลขงาน'
    },
    'Customer': {
      en: 'Customer',
      th: 'ลูกค้า'
    },
    'Customer Review': {
      en: 'Customer Review',
      th: 'รีวิวจากลูกค้า'
    },
    'Status Timeline': {
      en: 'Status Timeline',
      th: 'ไทม์ไลน์สถานะ'
    },
  
    // Error messages
    'Failed to load customers': {
      en: 'Failed to load customers',
      th: 'ไม่สามารถโหลดข้อมูลลูกค้า'
    },
    'An error occurred while loading customers': {
      en: 'An error occurred while loading customers',
      th: 'เกิดข้อผิดพลาดขณะโหลดข้อมูลลูกค้า'
    },
    'Failed to load job history': {
      en: 'Failed to load job history',
      th: 'ไม่สามารถโหลดประวัติงาน'
    },
    'An error occurred while loading jobs': {
      en: 'An error occurred while loading jobs',
      th: 'เกิดข้อผิดพลาดขณะโหลดข้อมูลงาน'
    }
  };
  
  export default translations;