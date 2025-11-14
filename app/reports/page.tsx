'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Download,
  FileDownload,
  PictureAsPdf,
  TableChart,
  CalendarToday,
  Description,
} from '@mui/icons-material';
import { generatePDFReport, generateExcelReport, fetchReportData } from '@/lib/reports';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

export default function Reports() {
  const [reportType, setReportType] = useState('all');
  const [dateRange, setDateRange] = useState('week');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [generating, setGenerating] = useState(false);
  const [recentReports, setRecentReports] = useState<any[]>([]);

  useEffect(() => {
    // Load any previously generated reports from localStorage
    const saved = localStorage.getItem('recentReports');
    if (saved) {
      setRecentReports(JSON.parse(saved));
    }
  }, []);

  const getDateRange = () => {
    const endDate = new Date();
    let startDate = new Date();
    
    switch(dateRange) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }
    
    return { startDate, endDate };
  };

  const handleGenerateReport = async (format: 'pdf' | 'excel' | 'csv') => {
    setGenerating(true);
    
    try {
      const { startDate, endDate } = getDateRange();
      
      // Fetch data based on filters
      const data = await fetchReportData({
        startDate,
        endDate,
        category: category !== 'all' ? category : undefined,
        status: status !== 'all' ? status : undefined,
        priority: priority !== 'all' ? priority : undefined,
      });

      const timestamp = new Date().toISOString().split('T')[0];
      let filename = '';

      if (format === 'pdf') {
        const pdf = await generatePDFReport(data);
        filename = `civic-report-${timestamp}.pdf`;
        pdf.save(filename);
        toast.success('PDF report generated successfully!');
      } else if (format === 'excel') {
        const wb = await generateExcelReport(data);
        filename = `civic-report-${timestamp}.xlsx`;
        XLSX.writeFile(wb, filename);
        toast.success('Excel report generated successfully!');
      } else if (format === 'csv') {
        // Generate CSV
        const csvContent = generateCSV(data.issues || []);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        filename = `civic-report-${timestamp}.csv`;
        saveAs(blob, filename);
        toast.success('CSV report generated successfully!');
      }

      // Add to recent reports
      const newReport = {
        id: Date.now().toString(),
        name: filename,
        type: reportType,
        format,
        dateRange: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        generatedAt: new Date(),
        issueCount: data.issues?.length || 0,
      };

      const updated = [newReport, ...recentReports.slice(0, 9)];
      setRecentReports(updated);
      localStorage.setItem('recentReports', JSON.stringify(updated));

    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const generateCSV = (issues: any[]) => {
    const headers = ['ID', 'Title', 'Description', 'Category', 'Priority', 'Status', 'Location', 'Reporter', 'Created Date'];
    const rows = issues.map(issue => [
      issue.id,
      issue.title,
      issue.description,
      issue.category,
      issue.priority,
      issue.status,
      issue.location?.address || 'N/A',
      issue.user_name || issue.user_email,
      new Date(issue.created_at).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\\n');

    return csvContent;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 3 }}>
        Reports
      </Typography>

      <Grid container spacing={3}>
            {/* Report Generation */}
            <Grid item xs={12} lg={8}>
              <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 3 }}>
                    Generate New Report
                  </Typography>

                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="Report Type"
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        size="small"
                      >
                        <MenuItem value="all">All Issues</MenuItem>
                        <MenuItem value="pending">Pending Issues</MenuItem>
                        <MenuItem value="resolved">Resolved Issues</MenuItem>
                        <MenuItem value="critical">Critical Issues</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="Date Range"
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        size="small"
                      >
                        <MenuItem value="today">Today</MenuItem>
                        <MenuItem value="week">Last 7 Days</MenuItem>
                        <MenuItem value="month">Last Month</MenuItem>
                        <MenuItem value="quarter">Last Quarter</MenuItem>
                        <MenuItem value="year">Last Year</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        select
                        fullWidth
                        label="Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        size="small"
                      >
                        <MenuItem value="all">All Categories</MenuItem>
                        <MenuItem value="Road">Road</MenuItem>
                        <MenuItem value="Water">Water</MenuItem>
                        <MenuItem value="Electricity">Electricity</MenuItem>
                        <MenuItem value="Sanitation">Sanitation</MenuItem>
                        <MenuItem value="Traffic">Traffic</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        select
                        fullWidth
                        label="Status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        size="small"
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="in_progress">In Progress</MenuItem>
                        <MenuItem value="resolved">Resolved</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        select
                        fullWidth
                        label="Priority"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        size="small"
                      >
                        <MenuItem value="all">All Priorities</MenuItem>
                        <MenuItem value="critical">Critical</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="low">Low</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdf />}
                      onClick={() => handleGenerateReport('pdf')}
                      disabled={generating}
                      sx={{
                        bgcolor: '#DC2626',
                        '&:hover': { bgcolor: '#B91C1C' },
                      }}
                    >
                      Generate PDF
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <TableChart />}
                      onClick={() => handleGenerateReport('excel')}
                      disabled={generating}
                      sx={{
                        bgcolor: '#059669',
                        '&:hover': { bgcolor: '#047857' },
                      }}
                    >
                      Generate Excel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <Description />}
                      onClick={() => handleGenerateReport('csv')}
                      disabled={generating}
                      sx={{
                        bgcolor: '#7C3AED',
                        '&:hover': { bgcolor: '#6D28D9' },
                      }}
                    >
                      Generate CSV
                    </Button>
                  </Box>

                  <Alert severity="info" sx={{ mt: 3 }}>
                    Reports include comprehensive data based on your selected filters. PDF reports include charts and summaries, Excel reports include multiple sheets with detailed analysis, and CSV files provide raw data for custom analysis.
                  </Alert>
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Stats */}
            <Grid item xs={12} lg={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <FileDownload sx={{ color: '#757575', mr: 1 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Export Formats
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip label="PDF" size="small" sx={{ bgcolor: '#FEE2E2', color: '#DC2626' }} />
                        <Chip label="Excel" size="small" sx={{ bgcolor: '#D1FAE5', color: '#059669' }} />
                        <Chip label="CSV" size="small" sx={{ bgcolor: '#EDE9FE', color: '#7C3AED' }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                        Report Features
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="caption" sx={{ color: '#757575' }}>
                          • Real-time data from database
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#757575' }}>
                          • Custom date range selection
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#757575' }}>
                          • Filter by category & priority
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#757575' }}>
                          • Professional formatting
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {/* Recent Reports */}
            <Grid item xs={12}>
              <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>
                    Recent Reports
                  </Typography>
                  
                  {recentReports.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Report Name</TableCell>
                            <TableCell>Date Range</TableCell>
                            <TableCell>Format</TableCell>
                            <TableCell>Issues</TableCell>
                            <TableCell>Generated</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {recentReports.map((report) => (
                            <TableRow key={report.id}>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {report.name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption" sx={{ color: '#757575' }}>
                                  {report.dateRange}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={report.format.toUpperCase()} 
                                  size="small"
                                  sx={{
                                    bgcolor: report.format === 'pdf' ? '#FEE2E2' : 
                                            report.format === 'excel' ? '#D1FAE5' : '#EDE9FE',
                                    color: report.format === 'pdf' ? '#DC2626' : 
                                          report.format === 'excel' ? '#059669' : '#7C3AED'
                                  }}
                                />
                              </TableCell>
                              <TableCell>{report.issueCount}</TableCell>
                              <TableCell>
                                <Typography variant="caption" sx={{ color: '#757575' }}>
                                  {new Date(report.generatedAt).toLocaleString()}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
                        No reports generated yet
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
    </Box>
  );
}