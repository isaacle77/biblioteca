import React from "react";
import {View,Text,StyleSheet,ImageBackground,Image,KeyboardAvoidingView,Alert} from "react-native";
import * as Permissions from "expo-permissions";
import { BarCodeScanner } from "expo-barcode-scanner";
import { TextInput, Touchable, TouchableOpacity } from "react-native-web";
import db from "../config";
const bgImage = require("../assets/background2.png");
const appIcon = require("../assets/appIcon.png");
const appName = require("../assets/appName.png");

export default class Transaction extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      studentId: "",
      bookId: "",
      domState: "normal",
      hasCameraPermissions: null,
      scanned: false,
      scannedData: ""
    }
    

  }
  getCameraPermissions = async domState =>{
    const{status}= await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermissions: status === "granted",
      domState: domState,
      scanned: false
    })
  }
  handleBarCodeScanned=async({type,data})=>{
    const {domState}=this.state;
    if(domState==="bookId"){
      this.setState({
        bookId: data,
        domState: "normal",
        scanned: true
      })
    }
    else if (domState==="studentId"){
      this.setState({
        studentId: data,
        domState: "normal",
        scanned: true
      })
    }
  }
  handleTransaction=async()=>{
   var {bookId,studentId}=this.state;
   await this.getBookdetails(bookId);
   await this.getStudentdetails(studentId);
   db.colletion("books").doc(bookId).get().then(doc=>{
	  console.log(doc.data());
    var book=doc.data();
    if(book.is_book_available){
      var{bookName,studentName}=this.state;
      this.initiateBookIssue(bookId,bookName,studentId,studentName);
      alert("livro entregue para o aluno");
    }
    else{
      var{bookName,studentName}=this.state;
      this.initiateBookReturn(bookId,bookName,studentId,studentName);
      alert("livro entregue a biblioteca")
    }
	 })
  }
  getBookdetails=bookId=>{
    bookId=bookId.trim();
    db.collection("books").where("book_id","==",bookId).get().then(snapshot=>{
      this.setState({bookName : doc.data().book_details.book_name})
    })
  }
  getStudentdetails=studentId=>{
    studentId=studentId.trim();
    db.collection("students").where("student_id","==",studentId).get().then(snapshot=>{
      this.setState({studentName : doc.data().student_details.student_name})
    })
  }
  initiateBookIssue=async(bookId,studentId,bookName,studentName)=>{
    db.collection("transactions").add({
      student_id: studentId,
      student_name: studentName,
      book_id: bookId,
      book_name: bookName,
      date:firebase.firestore.Timestamp.now().toDate(),
      transaction_type: "issue"
    });
    db.collection("books").doc(bookId).update({is_book_available:false});
    db.collection("students").doc(studentId).update({number_of_books_issued:firebase.firestore.FieldValue.increment(1)});
    this.setState({bookId:"",studentId:""})
  }
  initiateBookReturn=async(bookId,studentId,bookName,studentName)=>{
    db.collection("transactions").add({
      student_id: studentId,
      student_name: studentName,
      book_id: bookId,
      book_name: bookName,
      date:firebase.firestore.Timestamp.now().toDate(),
      transaction_type: "return"
    });
    db.collection("books").doc(bookId).update({is_book_available:true});
    db.collection("students").doc(studentId).update({number_of_books_issued:firebase.firestore.FieldValue.increment(-1)});
    this.setState({bookId:"",studentId:""})
  }


    render(){
      const {domState,hasCameraPermissions,scannedData,scanned}=this.state;
      if(domState==="scanner"){
        return(
          <BarCodeScanner onBarCodeScanned={scanned?undefined:this.handleBarCodeScanned}/>
        )
      }
      return(
        <KeyboardAvoidingView>
            <ImageBackground source={bgImage}style={styles.bgImage}>
              <View style={styles.upperContainer}>
                <Image source={appIcon}style={styles.appIcon}/>
                <Image source={appName}style={styles.appName}/>
              </View>
            <View style={styles.lowerContainer}>
              <View style={styles.textinputContainer}>
                <TextInput 
                style={styles.textinput}
                placeholder={"Id livro"}
                value={bookId}
		onChangeText={text=>this.setState({bookId:text})}
                />
               <TouchableOpacity 
                onPress={()=>this.getCameraPermissions("bookId")}>
                <Text>Digitalizar</Text>
               </TouchableOpacity>
              </View>
            
            <View style={[styles.textinputContainer,{marginTop:25}]}>
                <TextInput 
                style={styles.textinput}
                placeholder={"Id do estudante"}
                value={studentId}
		onChangeText={text=>this.setState({studentId:text})}
                />
               <TouchableOpacity 
                onPress={()=>this.getCameraPermissions("studentId")}>
                <Text>Digitalizar</Text>
               </TouchableOpacity>
              </View>
              <TouchableOpacity
              style={[styles.button, { marginTop: 25 }]}
              onPress={this.handleTransaction}
            >
              <Text style={styles.buttonText}>Enviar</Text>
            </TouchableOpacity>
            </View>
            </ImageBackground>
        </KeyboardAvoidingView>
      )
    }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  bgImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center"
  },
  upperContainer: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center"
  },
  appIcon: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginTop: 80
  },
  appName: {
    width: 180,
    resizeMode: "contain"
  },
  lowerContainer: {
    flex: 0.5,
    alignItems: "center"
  },
  textinputContainer: {
    borderWidth: 2,
    borderRadius: 10,
    flexDirection: "row",
    backgroundColor: "#9DFD24",
    borderColor: "#FFFFFF"
  },
  textinput: {
    width: "57%",
    height: 50,
    padding: 10,
    borderColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 3,
    fontSize: 18,
    backgroundColor: "#5653D4",
    fontFamily: "Rajdhani_600SemiBold",
    color: "#FFFFFF"
  },
  scanbutton: {
    width: 100,
    height: 50,
    backgroundColor: "#9DFD24",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  scanbuttonText: {
    fontSize: 20,
    color: "#0A0101",
    fontFamily: "Rajdhani_600SemiBold"
  },
  button: {
    width: "43%",
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F48D20",
    borderRadius: 15
  },
  buttonText: {
    fontSize: 24,
    color: "#FFFFFF",
    fontFamily: "Rajdhani_600SemiBold"
  }
});