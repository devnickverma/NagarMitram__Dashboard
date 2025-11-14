import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { supabase } from './supabase';

interface ReportData {
  issues?: any[];
  startDate?: Date;
  endDate?: Date;
  category?: string;
  status?: string;
}

export async function generatePDFReport(data: ReportData) {
  const pdf = new jsPDF();
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Header with colored background
  pdf.setFillColor(176, 209, 199); // Brand green color
  pdf.rect(0, 0, 210, 45, 'F');

  // Logo/Title
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('NagarMitra', 105, 20, { align: 'center' });

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Civic Issue Management Report', 105, 30, { align: 'center' });

  // Report metadata in white box
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(224, 224, 224);
  pdf.roundedRect(15, 38, 180, 16, 2, 2, 'FD');

  pdf.setFontSize(9);
  pdf.setTextColor(107, 114, 128);
  pdf.text(`Generated: ${currentDate}`, 20, 46);

  if (data.startDate || data.endDate) {
    const dateRange = `Period: ${data.startDate ? data.startDate.toLocaleDateString() : 'All'} - ${data.endDate ? data.endDate.toLocaleDateString() : 'Present'}`;
    pdf.text(dateRange, 105, 46, { align: 'center' });
  }

  pdf.setFontSize(8);
  pdf.text('Status: Confidential', 190, 46, { align: 'right' });

  // Summary Statistics
  const issues = data.issues || [];
  const totalIssues = issues.length;
  const resolvedIssues = issues.filter(i => i.status === 'resolved').length;
  const pendingIssues = issues.filter(i => i.status === 'pending').length;
  const inProgressIssues = issues.filter(i => i.status === 'in_progress').length;
  const criticalIssues = issues.filter(i => i.priority === 'critical').length;
  const highIssues = issues.filter(i => i.priority === 'high').length;

  // Section Title
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(66, 66, 66);
  pdf.text('Executive Summary', 15, 65);

  // Divider line
  pdf.setDrawColor(176, 209, 199);
  pdf.setLineWidth(0.5);
  pdf.line(15, 68, 195, 68);

  // Key Metrics Cards
  const cardY = 75;
  const cardWidth = 43;
  const cardHeight = 25;
  const cards = [
    { label: 'Total Issues', value: totalIssues, color: [66, 66, 66] },
    { label: 'Resolved', value: resolvedIssues, color: [76, 175, 80] },
    { label: 'In Progress', value: inProgressIssues, color: [33, 150, 243] },
    { label: 'Pending', value: pendingIssues, color: [255, 152, 0] },
  ];

  cards.forEach((card, index) => {
    const x = 15 + (index * (cardWidth + 3));

    // Card background with gradient effect
    pdf.setFillColor(card.color[0], card.color[1], card.color[2]);
    pdf.setDrawColor(200, 200, 200);
    pdf.roundedRect(x, cardY, cardWidth, cardHeight, 3, 3, 'FD');

    // Value
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text(card.value.toString(), x + cardWidth / 2, cardY + 13, { align: 'center' });

    // Label
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(card.label, x + cardWidth / 2, cardY + 20, { align: 'center' });
  });

  // Detailed metrics table
  const summaryData = [
    ['Total Issues', '100%', totalIssues.toString()],
    ['Resolved Issues', `${((resolvedIssues / totalIssues) * 100).toFixed(1)}%`, resolvedIssues.toString()],
    ['In Progress', `${((inProgressIssues / totalIssues) * 100).toFixed(1)}%`, inProgressIssues.toString()],
    ['Pending', `${((pendingIssues / totalIssues) * 100).toFixed(1)}%`, pendingIssues.toString()],
    ['Critical Priority', `${((criticalIssues / totalIssues) * 100).toFixed(1)}%`, criticalIssues.toString()],
    ['High Priority', `${((highIssues / totalIssues) * 100).toFixed(1)}%`, highIssues.toString()],
  ];

  autoTable(pdf, {
    startY: cardY + cardHeight + 10,
    head: [['Metric', 'Percentage', 'Count']],
    body: summaryData,
    theme: 'striped',
    headStyles: {
      fillColor: [176, 209, 199],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      valign: 'middle'
    },
    styles: {
      fontSize: 9,
      cellPadding: 5,
      valign: 'middle'
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    },
    margin: { left: 15, right: 15 },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold', halign: 'left', valign: 'middle' },
      1: { cellWidth: 40, halign: 'center', valign: 'middle' },
      2: { cellWidth: 40, halign: 'center', valign: 'middle' }
    },
    didParseCell: function(data) {
      // Left-align the "Metric" header
      if (data.column.index === 0 && data.cell.section === 'head') {
        data.cell.styles.halign = 'left';
      }
      // Center-align "Percentage" and "Count" headers
      if ((data.column.index === 1 || data.column.index === 2) && data.cell.section === 'head') {
        data.cell.styles.halign = 'center';
      }
    }
  });

  // Issues by Category
  const categoryBreakdown = issues.reduce((acc: any, issue) => {
    acc[issue.category] = (acc[issue.category] || 0) + 1;
    return acc;
  }, {});

  const categoryData = Object.entries(categoryBreakdown)
    .sort((a: any, b: any) => b[1] - a[1]) // Sort by count descending
    .map(([cat, count]) => {
      const percentage = ((count as number / totalIssues) * 100).toFixed(1);
      return [
        cat.charAt(0).toUpperCase() + cat.slice(1),
        `${percentage}%`,
        count.toString()
      ];
    });

  const finalY1 = (pdf as any).lastAutoTable.finalY;

  // Section Title
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(66, 66, 66);
  pdf.text('Category Breakdown', 15, finalY1 + 15);

  // Divider line
  pdf.setDrawColor(176, 209, 199);
  pdf.setLineWidth(0.5);
  pdf.line(15, finalY1 + 18, 195, finalY1 + 18);

  autoTable(pdf, {
    startY: finalY1 + 23,
    head: [['Category', 'Percentage', 'Count']],
    body: categoryData,
    theme: 'striped',
    headStyles: {
      fillColor: [176, 209, 199],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      valign: 'middle'
    },
    styles: {
      fontSize: 9,
      cellPadding: 5,
      valign: 'middle'
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    },
    margin: { left: 15, right: 15 },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold', halign: 'left', valign: 'middle' },
      1: { cellWidth: 40, halign: 'center', valign: 'middle' },
      2: { cellWidth: 40, halign: 'center', valign: 'middle' }
    },
    didParseCell: function(data) {
      // Left-align the "Category" header
      if (data.column.index === 0 && data.cell.section === 'head') {
        data.cell.styles.halign = 'left';
      }
      // Center-align "Percentage" and "Count" headers
      if ((data.column.index === 1 || data.column.index === 2) && data.cell.section === 'head') {
        data.cell.styles.halign = 'center';
      }
    }
  });

  // Detailed Issues Table
  pdf.addPage();

  // Page header
  pdf.setFillColor(176, 209, 199);
  pdf.rect(0, 0, 210, 30, 'F');

  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('Detailed Issues Registry', 105, 18, { align: 'center' });

  const issueTableData = issues.slice(0, 100).map(issue => {
    return [
      issue.id.substring(0, 8) + '...',
      issue.title.substring(0, 40) + (issue.title.length > 40 ? '...' : ''),
      issue.category.charAt(0).toUpperCase() + issue.category.slice(1),
      issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1),
      issue.status.replace('_', ' ').charAt(0).toUpperCase() + issue.status.replace('_', ' ').slice(1),
      new Date(issue.created_at).toLocaleDateString()
    ];
  });

  autoTable(pdf, {
    startY: 40,
    head: [['Issue ID', 'Title', 'Category', 'Priority', 'Status', 'Created']],
    body: issueTableData,
    theme: 'grid',
    headStyles: {
      fillColor: [66, 66, 66],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [224, 224, 224],
      lineWidth: 0.1,
      valign: 'middle'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 10, right: 10 },
    columnStyles: {
      0: { cellWidth: 22, halign: 'center', fontStyle: 'bold', valign: 'middle' },
      1: { cellWidth: 70, halign: 'left', valign: 'middle' },
      2: { cellWidth: 25, halign: 'center', valign: 'middle' },
      3: { cellWidth: 28, halign: 'center', valign: 'middle' },
      4: { cellWidth: 28, halign: 'center', valign: 'middle' },
      5: { cellWidth: 22, halign: 'center', fontSize: 7, valign: 'middle' }
    },
    didParseCell: function(data) {
      // Color code priority column
      if (data.column.index === 3 && data.cell.section === 'body') {
        const text = data.cell.text[0];
        if (text.includes('Critical')) {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        } else if (text.includes('High')) {
          data.cell.styles.textColor = [234, 88, 12];
        } else if (text.includes('Medium')) {
          data.cell.styles.textColor = [245, 158, 11];
        } else {
          data.cell.styles.textColor = [34, 197, 94];
        }
      }
      // Color code status column
      if (data.column.index === 4 && data.cell.section === 'body') {
        const text = data.cell.text[0];
        if (text.includes('Resolved')) {
          data.cell.styles.textColor = [34, 197, 94];
          data.cell.styles.fontStyle = 'bold';
        } else if (text.includes('In progress')) {
          data.cell.styles.textColor = [59, 130, 246];
        } else {
          data.cell.styles.textColor = [156, 163, 175];
        }
      }
    }
  });

  // Footer on all pages
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);

    // Footer line
    pdf.setDrawColor(176, 209, 199);
    pdf.setLineWidth(0.5);
    pdf.line(15, pdf.internal.pageSize.height - 20, 195, pdf.internal.pageSize.height - 20);

    // Footer text
    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128);
    pdf.setFont('helvetica', 'normal');

    pdf.text(
      'NagarMitra | Civic Issue Management System',
      15,
      pdf.internal.pageSize.height - 12
    );

    pdf.text(
      `Page ${i} of ${pageCount}`,
      105,
      pdf.internal.pageSize.height - 12,
      { align: 'center' }
    );

    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(176, 209, 199);
    pdf.text(
      'CONFIDENTIAL',
      195,
      pdf.internal.pageSize.height - 12,
      { align: 'right' }
    );
  }

  return pdf;
}

export async function generateExcelReport(data: ReportData) {
  const issues = data.issues || [];
  
  // Prepare data for Excel
  const worksheetData = issues.map(issue => ({
    'Issue ID': issue.id,
    'Title': issue.title,
    'Description': issue.description,
    'Category': issue.category,
    'Priority': issue.priority,
    'Status': issue.status,
    'Location': issue.location?.address || 'N/A',
    'Reporter': issue.user_name || issue.user_email,
    'Assigned To': issue.assigned_to || 'Unassigned',
    'Created Date': new Date(issue.created_at).toLocaleDateString(),
    'Updated Date': new Date(issue.updated_at).toLocaleDateString(),
    'Resolved Date': issue.resolved_at ? new Date(issue.resolved_at).toLocaleDateString() : 'Not Resolved',
    'Votes': issue.votes || 0,
    'Comments': issue.comments_count || 0
  }));

  // Create workbook and worksheets
  const wb = XLSX.utils.book_new();
  
  // Main data worksheet
  const ws = XLSX.utils.json_to_sheet(worksheetData);
  
  // Set column widths
  const colWidths = [
    { wch: 36 },  // Issue ID
    { wch: 40 },  // Title
    { wch: 60 },  // Description
    { wch: 20 },  // Category
    { wch: 15 },  // Priority
    { wch: 15 },  // Status
    { wch: 40 },  // Location
    { wch: 30 },  // Reporter
    { wch: 30 },  // Assigned To
    { wch: 15 },  // Created Date
    { wch: 15 },  // Updated Date
    { wch: 15 },  // Resolved Date
    { wch: 10 },  // Votes
    { wch: 10 }   // Comments
  ];
  ws['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(wb, ws, 'Issues');

  // Summary worksheet
  const summaryData = [
    ['Metric', 'Value', 'Percentage'],
    ['Total Issues', issues.length, '100%'],
    ['Resolved', issues.filter(i => i.status === 'resolved').length, `${((issues.filter(i => i.status === 'resolved').length / issues.length) * 100).toFixed(1)}%`],
    ['In Progress', issues.filter(i => i.status === 'in_progress').length, `${((issues.filter(i => i.status === 'in_progress').length / issues.length) * 100).toFixed(1)}%`],
    ['Pending', issues.filter(i => i.status === 'pending').length, `${((issues.filter(i => i.status === 'pending').length / issues.length) * 100).toFixed(1)}%`],
    ['', '', ''],
    ['Priority Breakdown', '', ''],
    ['Critical', issues.filter(i => i.priority === 'critical').length, `${((issues.filter(i => i.priority === 'critical').length / issues.length) * 100).toFixed(1)}%`],
    ['High', issues.filter(i => i.priority === 'high').length, `${((issues.filter(i => i.priority === 'high').length / issues.length) * 100).toFixed(1)}%`],
    ['Medium', issues.filter(i => i.priority === 'medium').length, `${((issues.filter(i => i.priority === 'medium').length / issues.length) * 100).toFixed(1)}%`],
    ['Low', issues.filter(i => i.priority === 'low').length, `${((issues.filter(i => i.priority === 'low').length / issues.length) * 100).toFixed(1)}%`],
  ];
  
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // Category Analysis worksheet
  const categoryBreakdown = issues.reduce((acc: any, issue) => {
    if (!acc[issue.category]) {
      acc[issue.category] = { total: 0, resolved: 0, pending: 0, in_progress: 0 };
    }
    acc[issue.category].total++;
    acc[issue.category][issue.status]++;
    return acc;
  }, {});

  const categoryData = [
    ['Category', 'Total', 'Resolved', 'In Progress', 'Pending'],
    ...Object.entries(categoryBreakdown).map(([cat, data]: [string, any]) => [
      cat,
      data.total,
      data.resolved || 0,
      data.in_progress || 0,
      data.pending || 0
    ])
  ];

  const wsCategory = XLSX.utils.aoa_to_sheet(categoryData);
  wsCategory['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, wsCategory, 'Category Analysis');

  return wb;
}

export async function fetchReportData(filters?: {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  status?: string;
  priority?: string;
}): Promise<ReportData> {
  try {
    let query = supabase.from('issues').select('*');

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString());
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString());
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching report data:', error);
      return { issues: [] };
    }

    return {
      issues: data || [],
      startDate: filters?.startDate,
      endDate: filters?.endDate,
      category: filters?.category,
      status: filters?.status
    };
  } catch (error) {
    console.error('Error in fetchReportData:', error);
    return { issues: [] };
  }
}