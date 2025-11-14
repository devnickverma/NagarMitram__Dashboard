import { Sequelize, DataTypes, Model } from 'sequelize';
import path from 'path';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: false,
});

export interface UserAttributes {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: 'admin' | 'staff' | 'citizen';
  status: 'active' | 'inactive';
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IssueAttributes {
  id?: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'new' | 'in-progress' | 'resolved';
  latitude: number;
  longitude: number;
  address: string;
  images?: string;
  reportedBy: string;
  assignedTo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends Model<UserAttributes> implements UserAttributes {
  public id!: string;
  public name!: string;
  public email!: string;
  public phone?: string;
  public password!: string;
  public role!: 'admin' | 'staff' | 'citizen';
  public status!: 'active' | 'inactive';
  public avatar?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export class Issue extends Model<IssueAttributes> implements IssueAttributes {
  public id!: string;
  public title!: string;
  public description!: string;
  public category!: string;
  public priority!: 'high' | 'medium' | 'low';
  public status!: 'new' | 'in-progress' | 'resolved';
  public latitude!: number;
  public longitude!: number;
  public address!: string;
  public images?: string;
  public reportedBy!: string;
  public assignedTo?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'staff', 'citizen'),
    defaultValue: 'citizen',
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'users',
});

Issue.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM('high', 'medium', 'low'),
    defaultValue: 'medium',
  },
  status: {
    type: DataTypes.ENUM('new', 'in-progress', 'resolved'),
    defaultValue: 'new',
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  images: {
    type: DataTypes.TEXT, // JSON array of image URLs
    allowNull: true,
  },
  reportedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  assignedTo: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: User,
      key: 'id',
    },
  },
}, {
  sequelize,
  tableName: 'issues',
});

// Associations
User.hasMany(Issue, { foreignKey: 'reportedBy', as: 'reportedIssues' });
Issue.belongsTo(User, { foreignKey: 'reportedBy', as: 'reporter' });

User.hasMany(Issue, { foreignKey: 'assignedTo', as: 'assignedIssues' });
Issue.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

export { sequelize };
export default { User, Issue, sequelize };