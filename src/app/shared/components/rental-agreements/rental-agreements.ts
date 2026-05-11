import { Component, computed, inject, signal } from '@angular/core';
import { PaymentStore } from '../../stores/paymentStore';
import { Shared } from '../../shared.module';
import { AuthStore } from '../../authStore';
import { RentalAgreement, MonthlyRentPayment } from '../../../core/interfaces/payment';
import { Input } from '@angular/core';

@Component({
  selector: 'app-rental-agreements',
  standalone: true,
  imports: [Shared],
  templateUrl: './rental-agreements.html',
  styleUrl: './rental-agreements.scss',
})
export class RentalAgreements {
  @Input() PaymentUrl: string = '';
  @Input() RentalPaymentUrl: string = '';
  store = inject(PaymentStore);
  authStore = inject(AuthStore);

  // State
  activeView = signal<'rentals' | 'sales'>('rentals');
  selectedAgreement = signal<RentalAgreement | null>(null);
  showDetails = signal(false);

  // Signals from store
  agreements = this.store.agreements;
  sales = computed(() => this.store.payments().filter((p) => p.payment_type === 'sale'));
  isLoading = this.store.isLoading;
  user = this.authStore.user;

  ngOnInit() {
    this.store.loadAgreements(this.RentalPaymentUrl);
    this.store.loadPayments(this.PaymentUrl);
  }

  openDetails(agreement: RentalAgreement) {
    this.selectedAgreement.set(agreement);
    this.showDetails.set(true);
  }

  closeDetails() {
    this.showDetails.set(false);
    this.selectedAgreement.set(null);
  }

  async payMonth(month: MonthlyRentPayment) {
    const agreement = this.selectedAgreement();
    if (!agreement || month.status === 'paid') return;

    const payload = {
      payment_type: 'monthly_rent',
      property_id: agreement.property,
      monthly_payment_id: month.id,
    };

    try {
      await this.store.processPayment(payload);
      // Refresh current agreement details from the list
      const updatedAgreements = this.store.agreements();
      const updated = updatedAgreements.find((a) => a.id === agreement.id);
      if (updated) this.selectedAgreement.set(updated);
      this.store.loadAgreements(this.RentalPaymentUrl);
    } catch (err) {
      console.error('Payment failed', err);
    }
  }

  async downloadReceipt(paymentId: string) {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    // 1. Find the payment data
    // Check main payments list (for sales/deposits)
    let paymentData: any = this.store.payments().find((p) => p.id === paymentId);

    // If not found, check monthly payments in agreements (for rent)
    if (!paymentData) {
      for (const agreement of this.agreements()) {
        const found = agreement.monthly_payments.find((mp) => mp.id === paymentId);
        if (found) {
          paymentData = {
            ...found,
            property_title: agreement.property_title,
            buyer: agreement.buyer,
            payment_type: 'monthly_rent',
            timestamp: found.date_paid,
          };
          break;
        }
      }
    }

    if (!paymentData) {
      console.error('Payment record not found');
      return;
    }

    const doc = new jsPDF();

    // -- Header Design --
    doc.setFillColor(30, 41, 59); // Dark blue
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT RECEIPT', 105, 25, { align: 'center' });

    // -- Parties Section --
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('BILLED TO (BUYER):', 15, 55);
    doc.text('ISSUED BY (SELLER):', 120, 55);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(paymentData.buyer || 'Valued Customer', 15, 62);
    doc.text(paymentData.seller || 'Verified Seller', 120, 62);

    // -- Info Section --
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Receipt ID: ${paymentData.id}`, 15, 75);
    doc.text(`Date: ${new Date(paymentData.timestamp || Date.now()).toLocaleDateString()}`, 15, 80);
    doc.text(`Status: ${paymentData.status?.toUpperCase() || 'SUCCESS'}`, 15, 85);

    // -- Table Section --
    const tableData = [
      ['Property Title', paymentData.property_title || 'N/A'],
      ['Payment Purpose', (paymentData.payment_type || 'Payment').replace('_', ' ').toUpperCase()],
      ['Amount Paid', `${parseFloat(paymentData.amount).toLocaleString()} PKR`],
      ['Transaction Ref', paymentData.stripe_charge_id || 'MOCK_STRIPE_TRX'],
    ];

    autoTable(doc, {
      startY: 95,
      head: [['Description', 'Details']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
      styles: { fontSize: 10, cellPadding: 6 },
    });

    // -- Footer --
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Total Amount:', 130, finalY);
    doc.text(`${parseFloat(paymentData.amount).toLocaleString()} PKR`, 195, finalY, {
      align: 'right',
    });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150, 150, 150);
    doc.text(
      'This is a computer-generated receipt and does not require a physical signature.',
      105,
      finalY + 40,
      { align: 'center' },
    );
    doc.text('Thank you for your business!', 105, finalY + 46, { align: 'center' });

    // Save PDF
    doc.save(`Receipt_${paymentId.substring(0, 8)}.pdf`);
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'ended':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-red-500/10 text-red-500 border-red-500/20';
    }
  }

  getPaymentStatusClass(status: string) {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-amber-500/20 text-amber-400';
      case 'late':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  }
}
