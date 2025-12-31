class TransactionModel {
  final String id;
  final String userId;
  final String partyId;
  final double amount;
  final String type;
  final String description;
  final String date;
  final String? category;
  final double runningBalance;
  final String createdAt;

  TransactionModel({
    required this.id,
    required this.userId,
    required this.partyId,
    required this.amount,
    required this.type,
    required this.description,
    required this.date,
    this.category,
    required this.runningBalance,
    required this.createdAt,
  });

  factory TransactionModel.fromJson(Map<String, dynamic> json) => TransactionModel(
    id: json['id'],
    userId: json['user_id'],
    partyId: json['party_id'],
    amount: (json['amount'] as num).toDouble(),
    type: json['transaction_type'] ?? json['type'],
    description: json['description'] ?? '',
    date: json['date'],
    category: json['category'],
    runningBalance: (json['running_balance'] as num?)?.toDouble() ?? 0.0,
    createdAt: json['created_at'],
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'user_id': userId,
    'party_id': partyId,
    'amount': amount,
    'transaction_type': type,
    'description': description,
    'date': date,
    'category': category,
    'running_balance': runningBalance,
    'created_at': createdAt,
  };
}
