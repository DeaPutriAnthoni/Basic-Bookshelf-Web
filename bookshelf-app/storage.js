const STORAGE_KEY = 'BOOK_APPS';
let books = [];

const checkStorage = () => {
  if(typeof(Storage) == undefined) {
    alert('Browser Anda Tidak Mendukung Web Storage!');
    return false;
  }

  return true;
}

const saveData = () => {
  const parseData = JSON.stringify(books);
  localStorage.setItem(STORAGE_KEY, parseData);
  document.dispatchEvent(new Event('ondatasaved'));
}

const loadDatafromStorage = () => {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  const data = JSON.parse(serializedData);

  if(data !== null)
    books = data;

  document.dispatchEvent(new Event('ondataloaded'));
}

const updateDataToStorage = () => {
  if(checkStorage())
    saveData();
}

function composeBookObject(title, author, year, isComplete) {
  return {
    id: +new Date(),
    title: title,
    author: author,
    year: parseInt(year),
    isComplete: isComplete
  };
}

const findBook = (bookId) => {
  for (book of books) {
    if(book.id === bookId)
      return book;
  }

  return null;
}

const findBookIndex = (bookId) => {
  let index = 0
  for (book of books) {
    if(book.id === bookId)
      return index;

    index++;
  }

   return -1;
}

const refreshDataFromBooks = () => {
  const bookUncompleted = document.getElementById(UNCOMPLETED_BOOK_ID);
  let bookCompleted = document.getElementById(COMPLETED_BOOK_ID);


  if (bookUncompleted && !bookUncompleted.hasAttribute('data-testid')) {
    bookUncompleted.setAttribute('data-testid', 'incompleteBookList');
  }
  
  if (bookCompleted && !bookCompleted.hasAttribute('data-testid')) {
    bookCompleted.setAttribute('data-testid', 'completeBookList');
  }

  for (book of books) {
    const newBook = makeBook(book.title, book.author, book.year, book.isComplete);
    newBook[BOOK_ITEMID] = book.id;
    
    newBook.setAttribute('data-bookid', (book.isComplete ? 'complete-' : 'incomplete-') + book.id);

    if (book.isComplete) {
      bookCompleted.append(newBook);
    } else {
      bookUncompleted.append(newBook);
    }
  }
}