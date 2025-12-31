import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  DatabaseHelper._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('khatabook.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future _createDB(Database db, int version) async {
    const idType = 'TEXT PRIMARY KEY';
    const textType = 'TEXT NOT NULL';
    const boolType = 'INTEGER NOT NULL';
    const doubleType = 'REAL NOT NULL';

    await db.execute('''
CREATE TABLE users (
  id $idType,
  email $textType,
  name $textType,
  phone TEXT,
  language TEXT,
  created_at $textType
)
''');

    await db.execute('''
CREATE TABLE parties (
  id $idType,
  user_id $textType,
  name $textType,
  phone $textType,
  email TEXT,
  address TEXT,
  party_type $textType,
  balance $doubleType,
  created_at $textType,
  is_synced $boolType DEFAULT 0
)
''');

    await db.execute('''
CREATE TABLE transactions (
  id $idType,
  user_id $textType,
  party_id $textType,
  amount $doubleType,
  type $textType,
  description $textType,
  date $textType,
  category TEXT,
  running_balance $doubleType,
  created_at $textType,
  is_synced $boolType DEFAULT 0
)
''');

    await db.execute('''
CREATE TABLE sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name $textType,
  action $textType,
  data $textType,
  created_at $textType
)
''');
  }

  Future<int> insert(String table, Map<String, dynamic> data) async {
    final db = await instance.database;
    return await db.insert(table, data, conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<List<Map<String, dynamic>>> queryAll(String table) async {
    final db = await instance.database;
    return await db.query(table);
  }

  Future<int> delete(String table, String id) async {
    final db = await instance.database;
    return await db.delete(table, where: 'id = ?', whereArgs: [id]);
  }

  Future close() async {
    final db = await instance.database;
    db.close();
  }
}
