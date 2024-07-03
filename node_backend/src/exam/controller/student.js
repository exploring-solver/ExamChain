const submitAnswer = async (studentId, questionId, answer, privateKey) => {
    const student = await Student.findById(studentId);
    const signature = ethers.utils.signMessage(answer, privateKey);
    
    const answerEntry = new Answer({
      questionId,
      studentId,
      answer,
      signature,
      timestamp: new Date(),
    });
    
    await answerEntry.save();
  };
  
  const verifyAnswer = async (answerId) => {
    const answerEntry = await Answer.findById(answerId).populate('studentId');
    const student = answerEntry.studentId;
    
    const isValid = ethers.utils.verifyMessage(answerEntry.answer, answerEntry.signature) === student.publicKey;
    return isValid;
  };
  
  const submitToLedger = async (answerId) => {
    const answerEntry = await Answer.findById(answerId).populate('studentId questionId');
    const student = answerEntry.studentId;
    const question = answerEntry.questionId;
  
    const record = {
      studentId: student.enrollmentNumber,
      question: question.content,
      answer: answerEntry.answer,
      signature: answerEntry.signature,
      timestamp: answerEntry.timestamp,
    };
  
    // Store this record on a blockchain or a distributed ledger
    // For simplicity, assume a function `storeOnLedger(record)` that does this
    await storeOnLedger(record);
  };
  
  const storeOnLedger = async (record) => {
    // Implementation depends on the chosen blockchain or distributed ledger
    console.log('Record stored on ledger:', record);
  };
  