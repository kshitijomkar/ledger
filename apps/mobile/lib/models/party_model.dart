class PartyModel {
  final String id;
  final String name;
  final String phone;
  final String? email;
  final String partyType;
  final double balance;

  PartyModel({required this.id, required this.name, required this.phone, this.email, required this.partyType, required this.balance});

  factory PartyModel.fromJson(Map<String, dynamic> json) => PartyModel(
    id: json['id'],
    name: json['name'],
    phone: json['phone'],
    email: json['email'],
    partyType: json['party_type'],
    balance: (json['balance'] as num).toDouble(),
  );
}
