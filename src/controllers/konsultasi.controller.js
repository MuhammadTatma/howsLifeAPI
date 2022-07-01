const moment = require('moment-timezone')
const dbPool = require('../db/connectDB')
const { StatusCodes, CREATED } = require('http-status-codes');
const CustomError = require('../errors')

const daftarKonsultasi = async (req, res) => {
    const { jenisKonselor, kelaminKonselor, riwayatKonsultasi, subject, masalah, usaha, kendala } = req.body
    const { userId } = req.user
    const timeStamp = moment.tz(new Date(), "Asia/Jakarta").format('YYYY-MM-DD HH:mm:ss')
    const q =  `INSERT INTO 
    konsultasi (id_user, pref_konselor_type, pref_kelamin_konselor, permasalahan, usaha, kendala, riwayat_tempat_lain, subject_masalah, created, status) VALUES ( ${userId}, "${jenisKonselor}", "${kelaminKonselor}", "${masalah}", "${usaha}", "${kendala}", ${riwayatKonsultasi}, "${subject}", "${timeStamp}", "waiting" )`

    await dbPool.query(q)
        .then(() => {
            return res.status(StatusCodes.CREATED).json({
                "success": true,
                "message" : "Successfully created",
                "data" : null
            })
        })
}

const addPreferensiWaktuKonsultasi = async (req, res) => {
    const { data } = req.body
    const { userId } = req.user

    let q = `SELECT id FROM konsultasi WHERE id_user = ${userId} AND status = "waiting"`;
    const [rows,fields] = await dbPool.query(q)

    const haveWaitingRequest = rows.length > 0
    if(!haveWaitingRequest){
        throw new CustomError.BadRequestError("You don't have waiting request")
    }
    const idKonsultasi = rows[0].id
    
    q = `INSERT INTO konsultasi_preferensi (id_konsultasi, time) VALUES `

    data.forEach( (iter) => {
        iter.time.forEach( (time) => {
            q += `(${idKonsultasi}, "${iter.date} ${time}"),`
        })
    });

    const finalQuery = q.slice(0,-1)
    await dbPool.query(finalQuery)
        .then(([rows,fields])=>{
            res.status(StatusCodes.CREATED).json({
                success : true,
                message : "Success Created Preferences ",
                data : null
            })
        })
}


module.exports = {
    daftarKonsultasi, addPreferensiWaktuKonsultasi
}
