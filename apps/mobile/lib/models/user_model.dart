class UserModel {
  final String id;
  final String email;
  final String name;
  final String? phone;
  final String? language;

  UserModel({required this.id, required this.email, required this.name, this.phone, this.language});

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
    id: json['id'],
    email: json['email'],
    name: json['name'],
    phone: json['phone'],
    language: json['language'],
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'email': email,
    'name': name,
    'phone': phone,
    'language': language,
  };
}
