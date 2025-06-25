# StrongHODL 💪

**Self-hosted Bitcoin portfolio tracker for true HODLers**

Track your Bitcoin investments privately on your own server. No third parties, no data sharing, complete control.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- 5 minutes of your time

### 1. Clone & Setup
```bash
git clone <your-repo-url>
cd stronghodl
cp docker.env.example .env
```

### 2. Configure Environment
Edit `.env` file:
```env
# Generate a secure secret (required)
NEXTAUTH_SECRET=your-super-secure-secret-key-here

# Database will be created automatically
DATABASE_URL=file:../stronghodl.db
```

### 3. Start StrongHODL
```bash
docker-compose up -d
```

### 4. Access Your Tracker
Open `http://localhost:3000` in your browser.

That's it! 🎉

## 🔧 Management

### View Logs
```bash
docker-compose logs -f stronghodl
```

### Stop/Start
```bash
docker-compose down
docker-compose up -d
```

### Backup Your Data
```bash
# Your Bitcoin data is in the stronghodl_data volume
docker run --rm -v stronghodl_data:/data -v $(pwd):/backup alpine \
  tar czf /backup/stronghodl-backup-$(date +%Y%m%d).tar.gz -C /data .
```

## 🛡️ Security

- **Self-hosted**: Your data never leaves your server
- **Encrypted**: Database and authentication are secure
- **Private**: No external API calls for sensitive data
- **Open Source**: Audit the code yourself

## 📊 Features

- Bitcoin transaction tracking
- Real-time price updates
- Portfolio performance analytics
- Import/export transactions
- Multi-currency support

## 🆘 Need Help?

- Check logs: `docker-compose logs -f stronghodl`
- Health check: `curl http://localhost:3000/api/health`
- System status: `curl http://localhost:3000/api/system/status`

## 📚 Documentation

- **[Database Schema](docs/DATABASE.md)** - Complete SQL structure, tables, and query examples
- **[API Reference](docs/API.md)** - Full REST API documentation with curl examples
- [Docker Deployment Guide](DOCKER.md) - Detailed Docker setup and configuration

---

**Happy HODLing!** 🚀 