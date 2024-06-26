const request = require('postman-request')

const pool = require("../../db.js");
const { addBookById, getBookByGoogleId } = require("./queries.js");


const getBookById = (req, res, next) => {
    const bookGoogleId = req.query.id;
    
    const url = `https://www.googleapis.com/books/v1/volumes/${bookGoogleId}`;

    request({ url: url, json: true }, (error, response, body) => {
        if (error) {
            console.error(error);
            res.status(500).send('İstek sırasında bir hata oluştu');
        } else if (body.totalItems == 0) {
            console.log("Girilen kitap bilgisi bulunamadı.");
            res.status(404).send('Girilen kitap bilgisi bulunamadı');
        } else {
            const theBook = body ? body : "";

            if(theBook !== ""){
                console.log("Kitap bilgileri : \n", theBook);
                req.bookTitle = theBook.volumeInfo.title;
                req.author = theBook.volumeInfo.authors[0];
                req.publisher = theBook.volumeInfo.publisher;
                req.bookDesc = theBook.volumeInfo.description;
                req.imgURL = theBook.volumeInfo.imageLinks.thumbnail;
                next();
            }
            else{
                return res.status(404).send({"msg": "kitap bulunamadi"});
            }
        }
    });
};


// const getNumberOfBooksByName = (req, res) => { // paging yaparak bi sayfada 10, 20 kitap göstereceğiz.

//     const { searchedBookName } = req.body; //Name bilgisi body'den geliyor.
//     console.log(searchedBookName);

// };

const addToReadingList = (req, res) => {

    const { id } = req.body; // KİTABIN unique id sini çeker.
    const userId = req.session.userId;

    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const tarih = `${year}-${month}-${day}`;

    pool.query(getBookByGoogleId, [id, userId], (error, results) => {
        if (error) throw error;
        const kitapVar = results.rows.length;
        if (kitapVar) {
            return res.status(200).send({ success: false });
        }
        pool.query(addBookById, [id, userId, 3, tarih, req.body.volumeInfo.title, req.body.volumeInfo.authors[0],req.body.volumeInfo.imageLinks.thumbnail], (error,
            results) => {
            if (error) {
                return res.status(200).send({ success: false });
            };
            return res.status(200).send({ success: true });
        })
    })
}


const searchTheBook = (req, res) => {

    const { bookSearch } = req.body;
    console.log("bookSearch: " + bookSearch); // aranacak kitabın ismini yazar.

    const url = `https://www.googleapis.com/books/v1/volumes?q=${bookSearch}&key=${process.env.BOOK_API_KEY}`;

    request({ url: url, json: true }, (error, response, body) => {
        if (error) {
            console.error(error);
            res.status(500).send('İstek sırasında bir hata oluştu');
        } else if (body.totalItems == 0) {
            console.log("Girilen kitap bilgisi bulunamadı.");
            res.status(404).send('Girilen kitap bilgisi bulunamadı');
        } else {
            // EJS view engine'i kullanarak kitapara.ejs sayfasını render et
            const books = body.items ? body.items : "";
            res.render('kitapAra', {books: books, username: req.session.username});
        }
    });
};

// listlerim kısmındaki kitap islemlerini burada halledeceğim.
const getOneBooksContentById = (req, res) => {

}

const getUsersBooksByCategory = (req, res) => {


}

const removeFromReadingList = (req, res) => {


}



const editBookInReadingList = (req, res) => {


}

// okuyorumdan okudum kısmına geçireceği zaman kullanacağız
const changeBooksCategoryInReadingList = (req, res) => {


}



module.exports = {addToReadingList, searchTheBook,getBookById };