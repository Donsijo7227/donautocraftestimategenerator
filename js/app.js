document.getElementById('billForm').addEventListener('submit', function(e) {
    e.preventDefault();
    generatePDF();
});
const deleteButton = document.getElementById("delete");
let balanceDue =0;

//balancudue calculation
function balanceDueCalculation(total,advance){
    return(total-advance);
}

//main function
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    //getting input values 
    function getInputValue(id, defaultValue = '') {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`Element with id "${id}" not found`);
            return defaultValue;
        }
        return element.value || defaultValue;
    }

    //page layout 
    function safeText(text, x, y, options = null) {
        if (y > 297 - 10) {  // A4 height in mm minus margin
            doc.addPage();
            y = 20;  // Reset y for the new page
        }
        doc.text(text.toString(), x, y, options);
    }

    //page layout
    function wrapText(text, maxWidth) {
        const lines = [];
        let line = '';

        for (let i = 0; i < text.length; i++) {
            line += text[i];
            if (doc.getTextWidth(line) > maxWidth) {
                lines.push(line.slice(0, -1));
                line = text[i];
            }
        }
        lines.push(line);
        return lines;
    }

    // Gather form data
    const customerName = getInputValue('customerName', 'Customer Name');
    const address = getInputValue('address', 'Address');
    const phone = getInputValue('phone', 0);
    // const billNo = getInputValue('billNo', 'N/A');
    const date = getInputValue('date', new Date().toISOString().split('T')[0]);
    const vehicleNo = getInputValue('vehicleNo', 'N/A');
    const vehicleType = getInputValue('vehicleType', 'N/A');
    // const advance = getInputValue('advancePayment', 0);

    // console.log(advance);

    // Capture items from dynamic rows
    const itemRows = document.querySelectorAll('.itemRow');
    let items = [];

    itemRows.forEach((row, index) => {
        const itemName = row.querySelector('.itemName').value;
        const itemQuantity = row.querySelector('.itemQuantity').value || '0';
        const itemPrice = row.querySelector('.itemPrice').value || '0';

        if (itemName) {
            items.push({ itemName, itemQuantity, itemPrice });
        }
    });

            // if (items.length === 0) {
            //     items = generateSampleItems(20);
            //     console.log('Using sample items:', items);
            // }
            // function generateSampleItems(count) {
            //     const items = [];
            //     for (let i = 1; i <= count; i++) {
            //         items.push({
            //             itemName: `Item ${i}`,
            //             itemQuantity: Math.floor(Math.random() * 10) + 1,
            //             itemPrice: (Math.random() * 100).toFixed(2)
            //         });
            //     }
            //     return items;
            // }

    // Capture selected bank details
    // const selectedBank = document.querySelector('input[name="bankDetails"]:checked').value;

    // let acName, acNo, bank, branch, ifsc;
    // if (selectedBank === 'esaf') {
    //     acName = 'THOMASKUTTY ANTONY';
    //     acNo = '5017 0015 9826 72';
    //     bank = 'ESAF BANK';
    //     branch = 'CHENGALAM EAST';
    //     ifsc = 'ESMF0001138';
    // } else if (selectedBank === 'iob') {
    //     acName = 'THOMASKUTTY ANTONY';
    //     acNo = '3417 0100 0001 049';
    //     bank = 'INDIAN OVERSEAS BANK';
    //     branch = 'PONKUNNAM';
    //     ifsc = 'IOBA0003417';
    // }
    

    //Deleting an entry 
    // deleteButton.addEventListener("click", function(e){
    //         e.target.parentElement.remove();
    // },false);

    // Set up styles
    const styles = {
        header: { fontSize: 18, fontStyle: 'bold' },
        subHeader: { fontSize: 12, fontStyle: 'normal' },
        normal: { fontSize: 10, fontStyle: 'normal' },
        bold: { fontSize: 10, fontStyle: 'bold' }
    };

    function setTextStyle(style) {
        doc.setFontSize(style.fontSize);
        doc.setFont(undefined, style.fontStyle);
    }

    // var imgData = `data:image/png;base64,`;
    // Add letterhead
    // doc.line(10, 10, 200, 10);
    setTextStyle(styles.header);
    safeText('DON AUTOCRAFT', 105, 20, { align: 'center' });
    // doc.addImage(imgData, 'PNG', 10, 10, 190, 50);
    setTextStyle(styles.subHeader);
    safeText('CHENGALAM P.O, PONKUNNAM, KOTTAYAM, PIN: 686585', 105, 27, { align: 'center' });
    safeText('Phone: 9447343276', 105, 34, { align: 'center' });
    doc.line(10, 38, 200, 38);

    // Add customer details and bill info
    let yPos = 50;
    setTextStyle(styles.bold);
    safeText('To:', 10, yPos);
    // safeText(`Bill No: ${billNo}`, 150, yPos);
    setTextStyle(styles.normal);
    safeText(customerName, 10, yPos + 7);
    safeText(`Date: ${date}`, 150, yPos + 7);
    safeText(address, 10, yPos + 14);
    safeText(`Vehicle No: ${vehicleNo}`, 150, yPos + 14);
    if (phone>0) {
        safeText(`Phone: ${phone}`, 10, yPos + 21);
    }
    
    safeText(`Vehicle Type: ${vehicleType}`, 150, yPos + 21);

    //header
    setTextStyle(styles.bold);
    setTextStyle(styles.subHeader);
    safeText('Estimate', 90, yPos+25);

     // Add items table header
     yPos += 35;
     setTextStyle(styles.bold);
     safeText('Sl No', 10, yPos);
     safeText('Item Description', 30, yPos);
     safeText('Qty', 120, yPos);
     safeText('Price', 162.5, yPos);
     doc.line(10, yPos + 3, 200, yPos + 3);
     yPos += 7;
 
     // Add items
    let total = 0;
    let currentPage = 1;
    let itemsOnCurrentPage = 0;
    const maxItemsPerPage = 18; // Set the maximum number of items per page

    items.forEach((item, index) => {
        if (item.itemName) {
            const itemQuantity = parseFloat(item.itemQuantity) || 0;
            const itemPrice = parseFloat(item.itemPrice) || 0;
            const itemTotalPrice = itemPrice;

            const wrappedItemName = wrapText(item.itemName, 70);

            // Add Serial Number
            setTextStyle(styles.normal);
            safeText(`${index + 1}`, 12.5, yPos);

            // Add Item Description
            wrappedItemName.forEach((line, lineIndex) => {
                safeText(line, 32.5, yPos + (lineIndex * 7));
            });

            // Add Quantity
            safeText(`${itemQuantity}`, 122, yPos);

            // Add Price
            safeText(`${itemTotalPrice.toFixed(2)}`, 172, yPos, { align: 'right' });

            total += itemTotalPrice;
            yPos += wrappedItemName.length * 7;
            itemsOnCurrentPage += 1;

            if (itemsOnCurrentPage >= maxItemsPerPage) {
                doc.addPage();
                yPos = 50;
                itemsOnCurrentPage = 0;
                currentPage += 1;
            }
        }
    });
    
    
     // Add total
     yPos += 5;
     doc.line(10, yPos, 200, yPos);
     yPos += 7;
     setTextStyle(styles.bold);
     safeText('Grand Total:', 120, yPos);
     safeText(`${total.toFixed(2)}`, 170, yPos, { align: 'right' });
    //  if(advance>0){
    //     balanceDue = balanceDueCalculation(total,advance);
    //     yPos += 10;
    //     safeText('Advance:', 120, yPos);
    //     safeText(`${advance}`, 170, yPos, { align: 'right' });
    //     yPos += 10;
    //     safeText('Balance Due:', 120, yPos);
    //     safeText(`${balanceDue}`, 170, yPos, { align: 'right' });
    //     // console.log(total);
    //     // console.log(advance);
    //     // console.log(balanceDue);
    // }
 
     // Add bank details and company sign
     // Calculate remaining space after rendering items
        const pageHeight = 297; // A4 page height in mm
        const margin = 10; // top/bottom margin
        const contentHeight = yPos; // current y position after items

        // Calculate the remaining space on the page
        const remainingSpace = pageHeight - contentHeight - margin;

        // If there's a lot of space left, add a gap before the bank details
        const gap = remainingSpace > 50 ? remainingSpace - 50 : 20; // Adjust 50 as needed

        yPos += gap;
     // Define the vertical spacing between lines
        const lineSpacing = 6.5;

        // Add bank details and company sign
        let bankDetailsY = yPos ;

        // // Set the text style for the bank details header
        setTextStyle(styles.bold);

        // // Print 'Bank Details:' on the left
        // safeText('Bank Details:', 10, bankDetailsY);

        // // Print 'For DON AUTOCRAFT' on the right
        safeText('For', 150, bankDetailsY);
        safeText('DON AUTOCRAFT', 150, bankDetailsY+10);

        // // Move the cursor down before printing the account details
        bankDetailsY += lineSpacing; // Move down by lineSpacing

        // // Set the text style back to normal for the bank details content
        setTextStyle(styles.normal);

        // // Print each line of the bank details, moving down by lineSpacing after each
        // const bankDetails = [
        //     `AC NAME : ${acName}`,
        //     `AC NO : ${acNo}`,
        //     `BANK : ${bank}`,
        //     `BRANCH : ${branch}`,
        //     `IFSC : ${ifsc}`
        // ];

        // // bankDetails.forEach((detail) => {
        //     safeText(detail, 10, bankDetailsY);
        //     bankDetailsY += lineSpacing; // Move down for the next line
        // });

 
            // Add bank details on a new page if necessary
            //  bankDetails.forEach((line, index) => {
            //      if (bankDetailsY + (index * 7) > 297 - 10) { // A4 height in mm minus margin
            //          doc.addPage();
            //          bankDetailsY = 20;  // Reset y for the new page
            //      }
            //      safeText(line, 10, bankDetailsY + (index * 7));
            //  });
        
            // Add the seal on the same page as the last bank detail line
            //  safeText('(seal)', 150, bankDetailsY + (bankDetails.length * 7) + 7);


    
       let today = new Date();

        // Formated the date as YYYY-MM-DD
        let formattedDate = today.getFullYear() + "-" + 
                            (today.getMonth() + 1).toString().padStart(2, '0') + "-" + 
                            today.getDate().toString().padStart(2, '0');

        // Create the custom file name
        // let fileName = `${customerName}-${formattedDate}.pdf`;
 
     doc.save(`${customerName}-${formattedDate}.pdf`);
}

// Dynamic item addition
document.getElementById('addItemButton').addEventListener('click', function () {
    const itemContainer = document.getElementById('itemsContainer');

    const itemRow = document.createElement('div');
    itemRow.classList.add('itemRow');

    const itemName = document.createElement('input');
    itemName.type = 'text';
    itemName.classList.add('itemName');
    itemName.placeholder = 'Item Name';
    itemName.required = true;

    const itemQuantity = document.createElement('input');
    itemQuantity.type = 'number';
    itemQuantity.classList.add('itemQuantity');
    itemQuantity.placeholder = 'Quantity';
    itemQuantity.min = '0';

    const itemPrice = document.createElement('input');
    itemPrice.type = 'number';
    itemPrice.classList.add('itemPrice');
    itemPrice.placeholder = 'Price';
    itemPrice.min = '0';
    itemPrice.step = '0.01';
    itemPrice.required = true;

    const xmark = document.createElement('button');
    xmark.type = "button";
    xmark.classList.add('delete');
    xmark.innerHTML=`X`;
    // Add event listener to the delete button
    xmark.addEventListener('click', function(e) {
        const itemRow = e.target.closest('.itemRow');
        
        // Applying the fade-out class
        itemRow.classList.add('fade-out');

        // Wait for the animation to complete, then remove the element
        setTimeout(function() {
            itemRow.remove();
        }, 200); // 
    });


    itemRow.appendChild(itemName);
    itemRow.appendChild(itemQuantity);
    itemRow.appendChild(itemPrice);
    itemRow.appendChild(xmark);

    itemContainer.appendChild(itemRow);
});
