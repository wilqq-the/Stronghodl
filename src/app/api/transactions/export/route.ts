import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BitcoinTransaction } from '@/lib/types';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv'; // csv or json
    const type = searchParams.get('type'); // BUY, SELL, or ALL
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    // Build Prisma query with filters
    const whereConditions: any = {};

    if (type && type !== 'ALL') {
      whereConditions.type = type;
    }

    if (dateFrom) {
      whereConditions.transactionDate = {
        ...whereConditions.transactionDate,
        gte: new Date(dateFrom)
      };
    }

    if (dateTo) {
      whereConditions.transactionDate = {
        ...whereConditions.transactionDate,
        lte: new Date(dateTo)
      };
    }

    // Fetch transactions using Prisma
    const rawTransactions = await prisma.bitcoinTransaction.findMany({
      where: whereConditions,
      orderBy: [
        { transactionDate: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Convert Prisma results to match expected format
    const transactions: BitcoinTransaction[] = rawTransactions.map(tx => ({
      id: tx.id,
      type: tx.type as 'BUY' | 'SELL',
      btc_amount: tx.btcAmount,
      original_price_per_btc: tx.originalPricePerBtc,
      original_currency: tx.originalCurrency,
      original_total_amount: tx.originalTotalAmount,
      fees: tx.fees,
      fees_currency: tx.feesCurrency,
      transaction_date: tx.transactionDate.toISOString().split('T')[0],
      notes: tx.notes || '',
      created_at: tx.createdAt.toISOString(),
      updated_at: tx.updatedAt.toISOString()
    }));

    if (format === 'json') {
      // JSON Export
      const jsonData = {
        export_info: {
          timestamp: new Date().toISOString(),
          total_transactions: transactions.length,
          filters: {
            type: type || 'ALL',
            date_from: dateFrom,
            date_to: dateTo
          }
        },
        transactions: transactions.map(tx => ({
          id: tx.id,
          type: tx.type,
          btc_amount: tx.btc_amount,
          original_price_per_btc: tx.original_price_per_btc,
          original_currency: tx.original_currency,
          original_total_amount: tx.original_total_amount,
          fees: tx.fees || 0,
          fees_currency: tx.fees_currency || tx.original_currency,
          transaction_date: tx.transaction_date,
          notes: tx.notes || '',
          created_at: tx.created_at,
          updated_at: tx.updated_at
        }))
      };

      return new NextResponse(JSON.stringify(jsonData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="bitcoin_transactions_${new Date().toISOString().split('T')[0]}.json"`
        }
      });
    } else {
      // CSV Export
      const csvHeaders = [
        'ID',
        'Type',
        'BTC Amount',
        'Price per BTC',
        'Currency',
        'Total Amount',
        'Fees',
        'Fees Currency',
        'Transaction Date',
        'Notes',
        'Created At',
        'Updated At'
      ];

      const csvRows = transactions.map(tx => [
        tx.id,
        tx.type,
        tx.btc_amount,
        tx.original_price_per_btc,
        tx.original_currency,
        tx.original_total_amount,
        tx.fees || 0,
        tx.fees_currency || tx.original_currency,
        tx.transaction_date,
        `"${(tx.notes || '').replace(/"/g, '""')}"`, // Escape quotes in notes
        tx.created_at,
        tx.updated_at
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="bitcoin_transactions_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }
  } catch (error) {
    console.error('Error exporting transactions:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to export transactions',
      message: 'An error occurred while exporting transactions'
    }, { status: 500 });
  }
} 