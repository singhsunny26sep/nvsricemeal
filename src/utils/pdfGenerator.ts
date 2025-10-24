import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import { Linking } from 'react-native';
import { CartItem } from '../context/CartContext';
import { Product } from '../constants/products';

export interface OrderDetails {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  orderDate: Date;
  items: CartItem[];
  subtotal: number;
  deliveryCharges: number;
  couponDiscount: number;
  gstAmount: number;
  totalAmount: number;
  paymentMethod: string;
  status?: string;
}

export class PDFGenerator {
  static generateInvoiceHTML(orderDetails: OrderDetails): string {
    const { orderId, customerName, customerEmail, customerPhone, customerAddress, orderDate, items, subtotal, deliveryCharges, couponDiscount, gstAmount, totalAmount, paymentMethod } = orderDetails;

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formatCurrency = (amount: number) => {
      return `₹${amount.toFixed(2)}`;
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${orderDetails.status === 'quote' ? 'Quote' : 'Invoice'} - ${orderId}</title>
        <style>
          body {
            font-family: 'Helvetica', Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            padding: 30px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #4CAF50;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #4CAF50;
          }
          .invoice-title {
            font-size: 24px;
            color: #333;
          }
          .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .details-section {
            flex: 1;
          }
          .details-section h3 {
            color: #4CAF50;
            margin-bottom: 10px;
            font-size: 16px;
          }
          .details-section p {
            margin: 5px 0;
            font-size: 14px;
            line-height: 1.5;
          }
          .order-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .order-info table {
            width: 100%;
            border-collapse: collapse;
          }
          .order-info td {
            padding: 8px;
            font-size: 14px;
          }
          .order-info td:first-child {
            font-weight: bold;
            color: #4CAF50;
            width: 120px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .items-table th {
            background-color: #4CAF50;
            color: white;
            padding: 12px;
            text-align: left;
            font-size: 14px;
          }
          .items-table td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
            font-size: 14px;
          }
          .items-table tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          .text-right {
            text-align: right;
          }
          .text-center {
            text-align: center;
          }
          .summary-section {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 14px;
          }
          .summary-row.total {
            font-weight: bold;
            font-size: 16px;
            color: #4CAF50;
            border-top: 2px solid #4CAF50;
            padding-top: 10px;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
          }
          .company-info {
            margin-bottom: 20px;
          }
          .company-info h2 {
            color: #4CAF50;
            margin-bottom: 5px;
          }
          .company-info p {
            margin: 2px 0;
            font-size: 13px;
          }
          @media print {
            body {
              background-color: white;
            }
            .invoice-container {
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="logo">NVS Rice Mall</div>
            <div class="invoice-title">${orderDetails.status === 'quote' ? 'QUOTATION' : 'INVOICE'}</div>
          </div>

          <div class="company-info">
            <h2>NVS Rice Mall</h2>
            <p>Premium Quality Rice & Rice Products</p>
            <p>Phone: +91 9876543210 | Email: info@nvsricemall.com</p>
            <p>GST No: 22AAAAA0000A1Z5</p>
          </div>

          <div class="invoice-details">
            <div class="details-section">
              <h3>Bill To:</h3>
              <p><strong>${customerName}</strong></p>
              <p>${customerEmail}</p>
              <p>${customerPhone}</p>
              <p>${customerAddress}</p>
            </div>
            <div class="details-section">
              <div class="order-info">
                <table>
                  <tr>
                    <td>Order ID:</td>
                    <td>${orderId}</td>
                  </tr>
                  <tr>
                    <td>Order Date:</td>
                    <td>${formatDate(orderDate)}</td>
                  </tr>
                  <tr>
                    <td>Payment Method:</td>
                    <td>${paymentMethod}</td>
                  </tr>
                </table>
              </div>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 5%">#</th>
                <th style="width: 40%">Product</th>
                <th style="width: 15%" class="text-center">Quantity</th>
                <th style="width: 20%" class="text-right">Unit Price</th>
                <th style="width: 20%" class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>
                    <strong>${item.product.name}</strong><br>
                    <small style="color: #666;">${item.product.brand} - ${item.product.weight}</small>
                  </td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">${formatCurrency(item.product.price)}</td>
                  <td class="text-right">${formatCurrency(item.product.price * item.quantity)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="summary-section">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>${formatCurrency(subtotal)}</span>
            </div>
            <div class="summary-row">
              <span>Delivery Charges:</span>
              <span>${formatCurrency(deliveryCharges)}</span>
            </div>
            ${couponDiscount > 0 ? `
              <div class="summary-row">
                <span>Coupon Discount:</span>
                <span>-${formatCurrency(couponDiscount)}</span>
              </div>
            ` : ''}
            <div class="summary-row">
              <span>GST (18%):</span>
              <span>${formatCurrency(gstAmount)}</span>
            </div>
            <div class="summary-row total">
              <span>Total Amount:</span>
              <span>${formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for shopping with NVS Rice Mall!</p>
            <p>For any queries, please contact our customer support.</p>
            <p>This is a computer-generated invoice and does not require a signature.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static async generatePDF(orderDetails: OrderDetails): Promise<string> {
    try {
      const htmlContent = this.generateInvoiceHTML(orderDetails);

      const options = {
        html: htmlContent,
        fileName: `${orderDetails.status === 'quote' ? 'quote' : 'invoice'}_${orderDetails.orderId}`,
        directory: RNFS.DocumentDirectoryPath,
        base64: false,
      };

      const file = await RNHTMLtoPDF.convert(options);

      if (!file || !file.filePath) {
        throw new Error('PDF generation failed - no file path returned');
      }

      // Ensure the file exists
      const fileExists = await RNFS.exists(file.filePath);
      if (!fileExists) {
        throw new Error('Generated PDF file does not exist');
      }

      // Copy file to downloads directory with a more accessible name
      const timestamp = Date.now();
      const fileName = `${orderDetails.status === 'quote' ? 'quote' : 'invoice'}_${orderDetails.orderId}_${timestamp}.pdf`;

      // Use external directory if available, otherwise use document directory
      let downloadPath;
      try {
        downloadPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
        await RNFS.copyFile(file.filePath, downloadPath);
      } catch (externalError) {
        // Fallback to document directory if external directory is not accessible
        console.warn('External directory not accessible, using document directory');
        downloadPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        await RNFS.copyFile(file.filePath, downloadPath);
      }

      // Clean up the original file
      try {
        await RNFS.unlink(file.filePath);
      } catch (cleanupError) {
        console.warn('Failed to cleanup temporary file:', cleanupError);
      }

      return downloadPath;
    } catch (error) {
      console.error('Error generating PDF:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to generate PDF: ${errorMessage}`);
    }
  }

  static async sharePDF(filePath: string, orderId: string): Promise<void> {
    try {
      const url = `file://${filePath}`;
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening PDF:', error);
      throw new Error('Failed to open PDF');
    }
  }

  static calculateOrderSummary(items: CartItem[], deliveryCharges: number = 40, couponDiscount: number = 0) {
    const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const gstRate = 0.18; // 18% GST
    const gstAmount = (subtotal - couponDiscount) * gstRate;
    const totalAmount = subtotal + deliveryCharges - couponDiscount + gstAmount;

    return {
      subtotal,
      deliveryCharges,
      couponDiscount,
      gstAmount,
      totalAmount,
    };
  }

  // Generate PDF from order history data
  static async generateOrderHistoryPDF(order: any, customerInfo: any = null): Promise<string> {
    try {
      // Convert order items to CartItem format for PDF generation
      const cartItems: CartItem[] = order.items.map((itemName: string, index: number) => ({
        product: {
          id: `item_${index}`,
          name: itemName,
          price: 0, // Price not available in current order structure
          description: '',
          image: '',
          category: '',
          weight: '',
          brand: '',
          rating: 0,
          reviewCount: 0,
          inStock: true,
        },
        quantity: 1,
        addedAt: new Date(order.date),
      }));

      const summary = this.calculateOrderSummary(cartItems, 0, 0);

      const orderDetails: OrderDetails = {
        orderId: order.id,
        customerName: customerInfo?.name || 'Customer',
        customerEmail: customerInfo?.email || 'customer@example.com',
        customerPhone: customerInfo?.phone || '9876543210',
        customerAddress: customerInfo?.address || 'Customer Address',
        orderDate: new Date(order.date),
        items: cartItems,
        subtotal: summary.subtotal,
        deliveryCharges: summary.deliveryCharges,
        couponDiscount: summary.couponDiscount,
        gstAmount: summary.gstAmount,
        totalAmount: order.total || summary.totalAmount,
        paymentMethod: 'Online Payment',
        status: order.status || 'invoice',
      };

      return await this.generatePDF(orderDetails);
    } catch (error) {
      console.error('Error generating order history PDF:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to generate order PDF: ${errorMessage}`);
    }
  }
}