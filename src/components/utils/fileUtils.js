/**
 * File utility functions for handling downloads and file operations
 */

/**
 * A helper function to trigger a file download in the browser.
 * This is used for exporting data.
 * @param {Object} params - Download parameters
 * @param {string} params.data - The data to download
 * @param {string} params.fileName - The name of the file
 * @param {string} params.fileType - The MIME type of the file
 */
export const downloadFile = ({ data, fileName, fileType }) => {
    const blob = new Blob([data], { type: fileType });
    const a = document.createElement('a');
    a.download = fileName;
    a.href = window.URL.createObjectURL(blob);
    const clickEvt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
    });
    a.dispatchEvent(clickEvt);
    a.remove();
};